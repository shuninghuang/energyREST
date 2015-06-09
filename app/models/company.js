var q = require('q');
var oracledb = require('oracledb');
module.exports = {
	getList: function(connection) {
		// connect();
		var defer = q.defer();	
		connection.execute(
            "SELECT ID, COMPANYNAME "
  		  + "FROM COMMON_COMPANY ",
  		  	{},
  		  	{
                outFormat: oracledb.OBJECT
            },
            function(err, result) {
                if (err) {
                	console.log("Company -> getList -> execute", err.message)
                    defer.reject(err.message);
                    return;
                }
	            else {
	            	var companies = result.rows;
	            	console.log("Company -> getList -> else", companies)
            		defer.resolve(companies);
	            }
	        }
	    );
		return defer.promise;
	}
}