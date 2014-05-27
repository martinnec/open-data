package cz.opendata.linked.server.resources.cz.coi;

import java.io.StringWriter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.rdf.model.StmtIterator;

import cz.opendata.linked.server.sparql.QueryHasTooManyResults;
import cz.opendata.linked.server.sparql.SparqlEndpoint;
import cz.opendata.linked.server.sparql.UnableToExecuteSPARQLQuery;

/**
 * Root resource (exposed at "class" path)
 */
@Path("check-action")
public class CheckActionResource {

	private SparqlEndpoint ep = new SparqlEndpoint("http://linked.opendata.cz/sparql");
	
	private static Map<String, String> prefixes = new HashMap<String, String>();
	static	{
		prefixes.put("http://purl.org/dc/terms/", "dcterms");
		prefixes.put("http://www.w3.org/2004/02/skos/core#", "skos");
		prefixes.put("http://schema.org/", "s");
		prefixes.put("http://linked.opendata.cz/ontology/coi.cz/", "coicz");
		prefixes.put("http://purl.org/goodrelations/v1#", "gr");
	}
		
    /**
     * Method handling HTTP GET requests. The returned object will be sent
     * to the client as "text/plain" media type.
     *
     * @return String that will be returned as a text/plain response.
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String describeResource(
    			@QueryParam("uri") String resourceURI
    		) {
    	
    	Model model = null;
    	
    	try {
			model = ep.execute(
"PREFIX dcterms: <http://purl.org/dc/terms/>\n" +
"PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n" +
"PREFIX s: <http://schema.org/>\n" +
"PREFIX coicz: <http://linked.opendata.cz/ontology/coi.cz/>\n" +
"PREFIX gr: <http://purl.org/goodrelations/v1#>\n" +
"\n" +
"CONSTRUCT {\n" +
" <" + resourceURI + ">\n" +
"    dcterms:date ?date ;\n" +
"    skos:notation ?id ;\n" +
"    s:instrument ?act ;\n" +
"    s:instrument ?actResource ;\n" +
"    s:result ?sanction ;\n" +
"    s:result ?confiscation ;\n" +
"    s:result ?ban ;\n" +
"    s:location ?location ;\n" +
"    s:object ?object .\n" +
"\n" +
" ?actResource dcterms:title ?actTitle .\n" +
"\n" +
" ?sanction dcterms:valid ?sanctionValidFrom ;\n" +
"    s:instrument ?sanctionActParagraph ;\n" +
"    s:instrument ?sanctionActResource ;\n" +
"    skos:notation ?sanctionId ;\n" +
"    s:result ?sanctionPriceSpecification .\n" +
"\n" +
" ?sanctionActResource dcterms:title ?sanctionActTitle .\n" +
"\n" +
" ?sanctionPriceSpecification gr:hasCurrency ?sanctionCurrency ;\n" +
"   gr:hasCurrencyValue ?sanctionValue .\n" +
"\n" +
" ?confiscation a coicz:Confiscation ;\n" +
"   skos:notation ?confiscationId ;\n" +
"   gr:includesObject ?confiscationObject .\n" +
"\n" +
" ?confiscationObject gr:amountOfThisGood ?confiscationObjectAmount ;\n" +
"   gr:typeOfGood ?confiscationObjectType .\n" +
"\n" +
" ?confiscationObjectType gr:category ?confiscationObjectCategory ;\n" +
"   gr:hasBrand ?confiscationObjectBrand .\n" +
"\n" +
" ?confiscationObjectBrand gr:name ?confiscationObjectBrandName .\n" +
"\n" +
" ?ban a coicz:Ban ;\n" +
"   skos:notation ?banId ;\n" +
"   gr:hasPriceSpecification ?banPriceSpecification ;\n" +
"   gr:includesObject ?banObject ;\n" +
"   s:instrument ?banAct .\n" +
"\n" +
" ?banPriceSpecification gr:hasCurrency ?banCurrency ;\n" +
"   gr:hasCurrencyValue ?banValue .\n" +
"\n" +
" ?banObject gr:amountOfThisGood ?banObjectAmount ;\n" +
"   gr:typeOfGood ?banObjectType .\n" +
"\n" +
" ?banObjectType gr:category ?banObjectCategory .\n" +
"\n" +
"} WHERE {\n" +
"  {\n" +
"    <" + resourceURI + ">\n" +
"      dcterms:date ?date ;\n" +
"      skos:notation ?id .\n" +
"  } UNION {\n" +
"    <" + resourceURI + ">\n" +
"      s:instrument ?act .\n" +
"    BIND(IRI(replace(?act, \"^[^0-9]*([0-9]{1,3})/([0-9]{4})\", \"http://linked.opendata.cz/resource/legislation/cz/act/$2/$1-$2\")) AS ?actResource)\n" +
"    OPTIONAL {\n" +
"      GRAPH <http://linked.opendata.cz/resource/dataset/legislation/psp.cz> {\n" +
"        ?actResource dcterms:title ?actTitle .\n" +
"      }\n" +
"    }   \n" +
"  } UNION {\n" +
"    <" + resourceURI + ">\n" +
"      s:result ?sanction .\n" +
"    ?sanction a coicz:Sanction ;\n" +
"      dcterms:valid ?sanctionValidFrom ;\n" +
"      coicz:zakon ?sanctionAct ;\n" +
"      coicz:paragraf ?sanctionParagraph ;\n" +
"      skos:notation ?sanctionId ;\n" +
"      s:result ?sanctionPriceSpecification .\n" +
"    BIND(concat(?sanctionAct, \", \", ?sanctionParagraph) AS ?sanctionActParagraph)\n" +
"    BIND(IRI(replace(?sanctionAct, \"^[^0-9]*([0-9]{1,3})/([0-9]{4})\", \"http://linked.opendata.cz/resource/legislation/cz/act/$2/$1-$2\")) AS ?sanctionActResource)\n" +
"    OPTIONAL {\n" +
"      GRAPH <http://linked.opendata.cz/resource/dataset/legislation/psp.cz> {\n" +
"        ?sanctionActResource dcterms:title ?sanctionActTitle .\n" +
"      }\n" +
"    }\n" +
"    ?sanctionPriceSpecification gr:hasCurrency ?sanctionCurrency ;\n" +
"      gr:hasCurrencyValue ?sanctionValue .\n" +
"  } UNION {\n" +
"    <" + resourceURI + ">\n" +
"      s:result ?confiscation .\n" +
"    ?confiscation a coicz:Confiscation ;\n" +
"      skos:notation ?confiscationId ;\n" +
"      gr:includesObject ?confiscationObject .\n" +
"    ?confiscationObject gr:amountOfThisGood ?confiscationObjectAmount ;\n" +
"      gr:typeOfGood ?confiscationObjectType .\n" +
"    ?confiscationObjectType gr:category ?confiscationObjectCategory ;\n" +
"      gr:hasBrand ?confiscationObjectBrand .\n" +
"    ?confiscationObjectBrand gr:name ?confiscationObjectBrandName .\n" +
"  } UNION {\n" +
"    <" + resourceURI + ">\n" +
"      s:result ?ban .\n" +
"    ?ban a coicz:Ban ;\n" +
"      skos:notation ?banId ;\n" +
"      gr:hasPriceSpecification ?banPriceSpecification ;\n" +
"      gr:includesObject ?banObject .\n" +
"    OPTIONAL {\n" +
"      ?ban coicz:zakon ?banAct .\n" +
"    }\n" +
"    ?banPriceSpecification gr:hasCurrency ?banCurrency ;\n" +
"      gr:hasCurrencyValue ?banValue .\n" +
"    ?banObject gr:amountOfThisGood ?banObjectAmount ;\n" +
"      gr:typeOfGood ?banObjectType .\n" +
"    ?banObjectType gr:category ?banObjectCategory .\n" +
"  } UNION {\n" +
"    <" + resourceURI + ">\n" +
"      s:location ?location .\n" +
"  } UNION {\n" +
"    <" + resourceURI + ">\n" +
"      s:object ?object .\n" +
"  }\n" +
"\n" +
"}"
					);
		} catch (QueryHasTooManyResults e) {
			e.printStackTrace();
			return "Unable to get the detail of resource <" + resourceURI + ">";
		} catch (UnableToExecuteSPARQLQuery e)	{
			e.printStackTrace();
			return "Unable to get the detail of resource <" + resourceURI + ">";
		}
    	
    	if ( model != null )	{
	    		    	
    		Map<String, String> jsonldContext = new LinkedHashMap<String, String>();
    		JsonObjectBuilder jsonResultBuilder = this.prepareJsonObjectBuilder(model, resourceURI, jsonldContext);
    		
    		if ( jsonldContext.size() > 0 )	{
	    		JsonObjectBuilder jsonldContextBuilder = Json.createObjectBuilder();
	    		Iterator<Map.Entry<String,String>> jsonldContextIt = jsonldContext.entrySet().iterator();
	    		while( jsonldContextIt.hasNext() )	{
	    			Map.Entry<String, String> jsonldContextItem = jsonldContextIt.next();
	    			jsonldContextBuilder.add(jsonldContextItem.getKey(), jsonldContextItem.getValue());
	    		}
	    		jsonResultBuilder.add("@context", jsonldContextBuilder);
    		}
    		
	    	JsonObject jsonResult = jsonResultBuilder.build();
	    	
	    	StringWriter writer = new StringWriter();
	    	try (JsonWriter jsonWriter = Json.createWriter(writer)) {
	    	   jsonWriter.writeObject(jsonResult);
	    	}

	    	String jsonData = writer.toString();
	    	System.out.println(jsonData);
	    	
	    	return jsonData;
	    	
    	}
    	
    	return "Empty result for resource <" + resourceURI + ">";
    	
    	
    }
    
    private JsonObjectBuilder prepareJsonObjectBuilder(Model model, String resourceURI, Map<String, String> jsonldContext)	{
    	
    	JsonObjectBuilder jsonResultBuilder = Json.createObjectBuilder();
    	
    	Resource detailedResource = model.getResource(resourceURI);
    	jsonResultBuilder.add("@id", resourceURI);
    	
    	StmtIterator stmti = detailedResource.listProperties();
    	while ( stmti.hasNext() )	{
    		
    		Statement stmt = stmti.next();
    		
    		String predicateURI = stmt.getPredicate().getURI();
    		int last = 0;
    		if ( predicateURI.contains("#") )	{
    			last = predicateURI.lastIndexOf('#');    			
    		} else {
    			last = predicateURI.lastIndexOf('/');
    		}
    		String predicateURI_prefix_part = predicateURI.substring(0, last+1);
    		String prefix = prefixes.get(predicateURI_prefix_part);
    		String predicateURI_suffix = predicateURI.substring(last+1);
    		String jsonPredicate = "";
    		if ( prefix != null && !"".equals(prefix) )	{
    			jsonPredicate = prefix + ":" + predicateURI_suffix;
    		} else {
    			jsonPredicate = predicateURI_suffix;
    		}
    		
    		if ( !jsonldContext.containsKey(jsonPredicate) )	{
    			jsonldContext.put(jsonPredicate, predicateURI);
    		}
    		
    		if ( stmt.getObject().isResource() )	{
    			jsonResultBuilder.add(jsonPredicate, this.prepareJsonObjectBuilder(model, stmt.getObject().asResource().getURI(), jsonldContext));
    		} else {
    			jsonResultBuilder.add(jsonPredicate, stmt.getObject().asLiteral().getString());
    		}
    		
    	}
    	
    	return jsonResultBuilder;
    }
    
    
}
