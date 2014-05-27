package cz.opendata.linked.server.sparql;

public class UnableToExecuteSPARQLQuery extends Exception {

	private static final long serialVersionUID = 6490404348108500867L;

	public UnableToExecuteSPARQLQuery()	{
		super();
	}
	
	public UnableToExecuteSPARQLQuery(String reason)	{
		super(reason);
	}
	
}