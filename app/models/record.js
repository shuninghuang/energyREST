var q = require('q');
var keys = ["id", "taskname", "algname", "starttime", "lasttime", "resultpath", "type", "user"]
function mapsConstructor (values, keys) {
	var maps = [];
	var map = {}
	for (var i in values) {
		var value = values[i];
		for (var index in value, keys) {
			map[keys[index]] = value[index];
		}
		maps.push(map);
		map = {};
	}
	return maps;
}
module.exports = {
	getList: function(connection) {
		// connect();
		var defer = q.defer();	
		connection.execute(
            "SELECT a.ID, a.TASKNAME, a.ALGTYPE, a.STARTTIME, a.LASTTIME, a.RESULT, a.TYPE, u.REALNAME "
            + "FROM COMMON_ALGORITHM a, COMMON_SYSUSER u "
            + "WHERE u.ID = a.USERID",
            function(err, result) {
                if (err) {
                    defer.reject(err.message);
                    return;
                }
	            else {
	            	var records = mapsConstructor(result.rows, keys);
            		defer.resolve(records);
	            }
	        }
	    );
		return defer.promise;
	},
	delete: function(connection, id) {
		// connect();
		var defer = q.defer();	
		connection.execute(
            "delete from COMMON_ALGORITHM where id=:id",
            {id: id},
            {autoCommit: true},
            function(err, result) {
                if (err) {
                    defer.reject(err.message);
                    return;
                }
	            else {
            		defer.resolve("删除成功");
	            }
	        }
	    );
		return defer.promise;
	}
}