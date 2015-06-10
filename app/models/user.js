var q = require('q');
var crypto = require('crypto');
var oracledb = require('oracledb');
module.exports = {
	getList: function(connection) {
		// connect();
		var defer = q.defer();	
		connection.execute(
            "select common_company.companyname, common_companydepartment.departmentname, common_sysuser.*, algorithm.name, algorithm.id as algorithmid "
            +"from common_sysuser "
            +    "left join common_company on common_company.id = common_sysuser.companyid "
            +    "left join common_companydepartment on common_companydepartment.id = common_sysuser.departmentid "
            +    "left join user_algorithm on user_algorithm.userid=common_sysuser.id "
            +    "left join algorithm on user_algorithm.algorithmid=algorithm.id",
            {},
            {
                outFormat: oracledb.OBJECT
            },
            function(err, result) {
                if (err) {
                    defer.reject(err.message);
                    return;
                }
	            else {
                    var results = {};
                    var ids = [];
                    for (var i in result.rows) {
                        var row = result.rows[i];
                        if (ids.indexOf(row.ID) === -1) {
                            ids.push(row.ID);
                            var algorithms = row.ALGORITHMID ? [{name: row.NAME, id: row.ALGORITHMID}] : [];
                            row.algorithms = algorithms;
                            results[row.ID] = row;
                            delete results[row.ID].NAME;
                            delete results[row.ID].ALGORITHMID;
                        }
                        else {
                            results[row.ID].algorithms.push({name: row.NAME, id: row.ALGORITHMID});
                            console.log(results[row.ID].algorithms, row.ID)
                        }
                    } 
            		defer.resolve(results);
	            }
	        }
	    );
		return defer.promise;
	},
	getUser: function(connection, userId) {
		var defer = q.defer();
		connection.execute(
            "SELECT u.ID, u.LOGINNAME, u.REALNAME, u.POST, u.PHONE, u.EMAIL, u.ADDRESS, u.DESCRIPTION, u.USERLEVEL, u.ONOFF, c.COMPANYNAME, d.DEPARTMENTNAME, u.COMPANYID, u.DEPARTMENTID "
  		  + "FROM COMMON_SYSUSER u, COMMON_COMPANY c, COMMON_COMPANYDEPARTMENT d "
 		  + "WHERE c.ID=u.COMPANYID and d.ID=u.DEPARTMENTID and u.ID = :id",
            [userId],
            {
                outFormat: oracledb.OBJECT
            },
            function(err, result) {
                if (err) {
                    defer.reject(err.message);
                    return;
                }
	            else {
	            	if (result.rows.length) {
                        console.log("user -> getUser", result.rows[0])
	            		defer.resolve(result.rows[0]);
	            	}
	            	else {
	            		defer.reject("Can't find that user");
	            	}
	            }
	        }
	    );
		return defer.promise;
	},
	auth: function(connection, userName, psw) {
		var defer = q.defer();
		var hash = crypto.createHash('md5').update(psw, 'utf8').digest("base64");
		connection.execute(
            "SELECT u.ID, u.PASSWORD "
  		  + "FROM COMMON_SYSUSER u, COMMON_COMPANY c, COMMON_COMPANYDEPARTMENT d "
 		  + "WHERE u.LOGINNAME = :username and c.ID = u.COMPANYID and d.ID = u.DEPARTMENTID",
            [userName],
            {
                outFormat: oracledb.OBJECT
            },
            function(err, result) {
                if (err) {
                    defer.reject(err.message);
                    return;
                }
	            else {
	            	if (result.rows.length) {
	            		var user = result.rows[0];
	            		user.PASSWORD === hash ? defer.resolve(user.ID) : defer.reject("Wrong password");
	            	}
	            	else defer.reject("Can't find that user");
	            }
	        }
	    );
		return defer.promise;	
	},
	post: function(connection, params) {
		var defer = q.defer();
        // params.uid = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT };
		connection.execute(
            "INSERT INTO COMMON_SYSUSER " 
            + "(REALNAME, PASSWORD, LOGINNAME, DEPARTMENTID, POST, PHONE, EMAIL, ADDRESS, COMPANYID, "
            + "DESCRIPTION, USERLEVEL, ONOFF) VALUES "
			+ "(:REALNAME, :PASSWORD, :LOGINNAME, :DEPARTMENTID, :POST, :PHONE, :EMAIL, :ADDRESS, :COMPANYID, "
			+ ":DESCRIPTION, :USERLEVEL, :ONOFF) ",
            { 	
            	REALNAME: params.REALNAME,
            	PASSWORD: params.PASSWORD,
            	LOGINNAME: params.LOGINNAME,
            	COMPANYID: params.COMPANYID,
            	DEPARTMENTID: params.DEPARTMENTID,
            	ADDRESS: params.ADDRESS,
            	POST: params.POST,
            	PHONE: params.PHONE,
            	EMAIL: params.EMAIL,
            	DESCRIPTION: params.DESCRIPTION,
            	USERLEVEL: params.USERLEVEL,
            	ONOFF: params.ONOFF
            },
            {
            	autoCommit: true,
                outFormat: oracledb.OBJECT
            },
            function(err, result) {
                if (err) {
                	console.log("User -> post", err.message)
                    defer.reject(err.message);
                    return;
                }
	            else {
	            	console.log("User -> post", result.rows, result.outBinds)
	            	defer.resolve("yeah");
	            }
	        }
	    );
		return defer.promise;
	},
    grant: function(connection, userId, params) {
        var defer = q.defer();
        if (params.insertion.length) {
            var insertion = params.insertion.map(function(algId) {
                return "into user_algorithm (userid, algorithmid) values (" + userId + ", " + algId + ")";
            });
            var sql = params.insertion.length !== 1 ? "insert all " + insertion.join(' ') + " select * from dual" : "insert " + insertion;
            connection.execute(
                sql,
                {},
                {
                    autoCommit: true
                },
                function(err, result) {
                    if (err) {
                        console.log("User -> grant -> insertion", err.message)
                        defer.reject(err.message);
                        return;
                    }
                    else {
                        defer.resolve("权限分配成功");
                    }
                }
            );
        } 
        if (params.removal.length) {
            var algorithms = "(" + params.removal.join(", ") + ")";
            connection.execute(
                "delete from user_algorithm where algorithmid in "+ algorithms + "and userid=" + userId,
                {},
                { autoCommit: true},
                function(err, result) {
                    if (err) {
                        console.log("User -> grant -> removal", err.message)
                        defer.reject(err.message);
                        return;
                    }
                    else {
                        defer.resolve("权限移除成功");
                    }
                }
            );
        }
        return defer.promise;
    },
	update: function(connection, params) {
		var defer = q.defer();	
		connection.execute(
            "UPDATE COMMON_SYSUSER SET "
            + "REALNAME = :realname, "
            + "LOGINNAME = :loginname, "
            + "DEPARTMENTID=:departmentid, "
            + "POST=:post, "
            + "PHONE=:phone, "
            + "EMAIL=:email, "
            + "ADDRESS=:address, "
            + "COMPANYID=:companyid, "
            + "DESCRIPTION=:description, "
            + "USERLEVEL=:userlevel, "
            + "ONOFF=:onoff "
            + "WHERE ID = :id",
            {
            	id: params.ID,
            	realname: params.REALNAME,
            	loginname: params.LOGINNAME,
            	companyid: params.COMPANYID,
            	departmentid: params.DEPARTMENTID,
            	address: params.ADDRESS,
            	post: params.POST,
            	phone: params.PHONE,
            	email: params.EMAIL,
            	description: params.DESCRIPTION,
            	userlevel: params.USERLEVEL,
            	onoff: params.ONOFF
            },
            {
            	autoCommit: true,
                outFormat: oracledb.OBJECT
            },
            function(err, result) {
                if (err) {
                	console.log("User -> update", err.message)
                    defer.reject(err.message);
                    return;
                }
	            else {
	            	defer.resolve("更新成功");
	            }
	        }
	    );
		return defer.promise;
	},
	delete: function(connection, id) {
		var defer = q.defer();
		connection.execute(
            "DELETE FROM COMMON_SYSUSER "
  		  + "WHERE ID = :id",
            [id],
            {
            	autoCommit: false
            },
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