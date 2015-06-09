var q = require('q');
var oracledb = require('oracledb');
module.exports = {
	getList: function(connection, companyId) {
		// connect();
		var defer = q.defer();	
		connection.execute(
            "SELECT ID, DEPARTMENTNAME "
  		  + "FROM COMMON_COMPANYDEPARTMENT "
  		  + "WHERE COMPANYID=:id ",
  		  	[companyId],
  		  	{
  		  		outFormat: oracledb.OBJECT	
  		  	},
            function(err, result) {
                if (err) {
                	console.log("Department -> getList", err.message)
                    defer.reject(err.message);
                    return;
                }
	            else {
	            	var departments = result.rows;
	            	console.log("Department -> getList", departments)
            		defer.resolve(departments);
	            }
	        }
	    );
		return defer.promise;
	}
}