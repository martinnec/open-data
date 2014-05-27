package cz.opendata.linked.server.sparql;

public class QueryHasTooManyResults extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3634418684097492971L;

	public QueryHasTooManyResults()	{
		super();
	}
	
	public QueryHasTooManyResults(String reason)	{
		super(reason);
	}
	
}