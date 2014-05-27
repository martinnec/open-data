package cz.opendata.linked.server.sparql;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;

import org.apache.log4j.Logger;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

public class VirtuosoSparqlEndpoint {
	
	private String endpointURL = "http://internal.opendata.cz:8890/sparql";
	
	private URL sparqlEndpoint;
	
	private URLConnection sparqlEndpointConn;
	
	private Logger logger = Logger.getLogger(VirtuosoSparqlEndpoint.class);
	
	private Model model = ModelFactory.createDefaultModel();
		
	private String charset = "UTF-8";
	
	private String sparqlResultFormat = "text/turtle";
	
	private int connectionTimeout = 30000;
	
	public VirtuosoSparqlEndpoint(String sparqlEndpointURL)	{
		
		this.endpointURL = sparqlEndpointURL;
		
	}
	
	public VirtuosoSparqlEndpoint(String endpointURL, int connectionTimeout)	{
		
		this.endpointURL = endpointURL;
		this.connectionTimeout = connectionTimeout;
		
	}
	
	public Model execute(String sparql) throws QueryHasTooManyResults, UnableToExecuteSPARQLQuery	{	
		OutputStream out = null;
		BufferedReader in = null;
		String requestQueryResult = new String();
		String requestQuery = "";
		
		logger.trace("Evaluating SPARQL query:");
		logger.trace(sparql);
		
		try	{	
			
			sparqlEndpoint = new URL(endpointURL);
			
			sparqlEndpointConn = sparqlEndpoint.openConnection();
			sparqlEndpointConn.setDoInput(true);
			sparqlEndpointConn.setDoOutput(true);
			sparqlEndpointConn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded;charset=" + charset);
			sparqlEndpointConn.setConnectTimeout(connectionTimeout);
			
			requestQuery = String.format("query=%s&default-graph-uri=%s&named-graph-uri=%s&format=%s&timeout=0",
					URLEncoder.encode(sparql, charset),
					URLEncoder.encode("", charset), 
					URLEncoder.encode("", charset),
					URLEncoder.encode(sparqlResultFormat, charset));
			
			out = sparqlEndpointConn.getOutputStream();
			
			long startTime = System.currentTimeMillis();
			
			out.write(requestQuery.getBytes(charset));
			logger.trace(requestQuery);
		
			in = new BufferedReader(new InputStreamReader(sparqlEndpointConn.getInputStream()));
		    String s;
		    while ((s = in.readLine()) != null) {
			    requestQueryResult += s;
			}
		    
		    long endTime = System.currentTimeMillis();
			long totalTime = endTime - startTime;
		    		    
		    logger.trace("Query evaluated in " + totalTime + "ms.");

		} catch (Exception e)	{
			logger.fatal("Unable to execute SPARQL query.");
			logger.fatal("Query: " + sparql);
			logger.fatal("Request: " + requestQuery);
			e.printStackTrace();
			throw new UnableToExecuteSPARQLQuery("Unable to execute SPARQL query: " + sparql);
		} finally {
			if ( out!=null )	{
				try	{
					out.close();
				} catch (Exception e)	{
					e.printStackTrace();
				}
			}
			if ( in!=null )	{
				try	{
					in.close();
				} catch (Exception e)	{
					e.printStackTrace();
				}
			}
		}
		
		return parseTurtle(requestQueryResult);
		
	}
	
	private Model parseTurtle(String turtle) throws QueryHasTooManyResults, UnableToExecuteSPARQLQuery	{
		try	{		
			model.removeAll();
			model.read(new ByteArrayInputStream(turtle.getBytes(charset)), null, "TURTLE");
			return model;
		} catch (UnsupportedEncodingException e)	{
			logger.fatal("Unable to parse the supplied TTL code because of unsupported encoding " + charset, e);
			throw new UnableToExecuteSPARQLQuery("Unable to parse the supplied TTL code because of unsupported encoding " + charset);
		} catch (Exception e)	{
			if ( turtle != null && turtle.length() > 0 && turtle.contains("Virtuoso 22015 Error FT038: wildcard has over") )	{
				logger.fatal("Virtuoso 22015 Error FT038: wildcard has too many matches", e);
				throw new QueryHasTooManyResults("Virtuoso 22015 Error FT038: wildcard has too many matches");
			} else {
				logger.fatal("Unable to parse the supplied TTL code because of some exception", e);
			}
		}
		return model;
	}

}
