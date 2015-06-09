var q = require('q');
var oracledb = require('oracledb');
module.exports = {
	getList: function(connection, userId) {
        // connect();
        var defer = q.defer();  
        connection.execute(
            "select algorithm_group.name as gname, algorithm_group.id as groupid, u.* "
            +    "from algorithm_group " 
            +        "left join "
            +            "(select * "
            +                "from "
            +                    "(select * " 
            +                        "from algorithm " 
            +                        "where algorithm.id in "
            +                        "(select algorithmid from user_algorithm where userid=:userId))) u "
            +          "on u.gid=algorithm_group.id",
            {
                userId: userId
            },
            {
                outFormat: oracledb.OBJECT
            },
            function(err, result) {
                if (err) {
                    console.log("algorithm -> getList -> err", err.message)
                    defer.reject(err.message);
                    return;
                }
                else {
                    defer.resolve(result.rows);
                }
            }
        );
        return defer.promise;
    },
    getTypes: function(connection) {
        var defer = q.defer();  
        connection.execute(
            "select * from algorithm_group",
            {},
            {
                outFormat: oracledb.OBJECT
            },
            function(err, result) {
                if (err) {
                    console.log("algorithm -> getList -> err", err.message)
                    defer.reject(err.message);
                    return;
                }
                else {
                    defer.resolve(result.rows);
                }
            }
        );
        return defer.promise;
    },
    createType: function(connection, name) {
        var defer = q.defer();  
        connection.execute(
            'INSERT INTO ALGORITHM_GROUP (NAME) VALUES (:name) '
        +   'RETURNING ID INTO :gid ',
            {
                name: name,
                gid: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            {
                autoCommit: true
            },
            function(err, result) {
                if (err) {
                    console.log("algorithm -> createType", err.message)
                    defer.reject(err.message);
                    return;
                }
                else {
                    // console.log("algorithm -> createType", result.outBinds.gid[0])
                    defer.resolve(result.outBinds.gid[0]);
                }
            }
        );
        return defer.promise;
    },
    update: function(connection, params) {
        var defer = q.defer();
        connection.execute(
            "UPDATE algorithm SET NAME=:name, CLASSPATH=:classpath, PARAMNAMES=:paramnames, PARAMTYPES=:paramtypes, GID=:gid WHERE ID=:id",
            {
                name: params.NAME,
                classpath: params.CLASSPATH,
                paramnames: params.PARAMNAMES,
                paramtypes: params.PARAMTYPES,
                id: params.ID,
                gid: params.GID
            },
            {
                autoCommit: true
            },
            function(err, result) {
                if (err) {
                    console.log("algorithm -> update", err)
                    defer.reject(err.message);
                    return;
                }
                else {
                    defer.resolve("HAHA");
                }
            }
        );
        return defer.promise;
    },
    updateType: function(connection, typeId, params) {
        var defer = q.defer();
        connection.execute(
            "UPDATE algorithm_group SET NAME=:name WHERE ID=:id",
            {
                name: params.name,
                id: typeId
            },
            {
                autoCommit: true
            },
            function(err, result) {
                if (err) {
                    console.log("algorithm_group -> update", err)
                    defer.reject(err.message);
                    return;
                }
                else {
                    defer.resolve("HAHA");
                }
            }
        );
        return defer.promise;
    },
    create: function(connection, userId, params) {
        var defer = q.defer();  
        connection.execute(
            "INSERT INTO ALGORITHM (GID, NAME, CLASSPATH, PARAMNAMES, PARAMTYPES) "  
            + "VALUES (:gid, :name, :classpath, : paramnames, :paramtypes) RETURNING ID INTO :id",
            {
                gid: params.GID,
                name: params.NAME,
                classpath: params.CLASSPATH,
                paramnames: params.PARAMNAMES,
                paramtypes: params.PARAMTYPES,
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            {
                autoCommit: true
            },
            function(err, result) {
                if (err) {
                    console.log("algorithm -> create -> err", err)
                    defer.reject(err.message);
                    return;
                }
                else {
                    var algorithmid = parseInt(result.outBinds.id[0]);
                    connection.execute(
                        "INSERT INTO USER_ALGORITHM (USERID, ALGORITHMID) VALUES (:userId, :id) ",
                        {
                            id: algorithmid,
                            userId: parseInt(userId)
                        },
                        {
                            autoCommit: true
                        },
                        function(err, result) {
                            if (err) {
                                console.log("algorithm -> create -> insert user_algorithm", err)
                                defer.reject(err.message);
                                return;
                            }
                            else {
                                defer.resolve(algorithmid);
                            }
                        }
                    );
                }
            }
        );
        return defer.promise;
    },
    deleteType: function(connection, typeId, params) {
        var defer = q.defer();
        console.log("algorithm -> deleteType", typeId)
        connection.execute(
            "DELETE from algorithm_group WHERE ID=:id",
            {
                id: typeId
            },
            {
                autoCommit: true
            },
            function(err, result) {
                if (err) {
                    console.log("algorithm -> deleteType", err)
                    defer.reject(err.message);
                    return;
                }
                else {
                    var sql = "UPDATE algorithm SET GID=" + params.rootId + "WHERE ID in (" + params.childrenIds.join(", ") + ")";
                    if (params.childrenIds.length) {
                        connection.execute(
                            sql,
                            {},
                            {
                                autoCommit: true
                            },
                            function(err, result) {
                                if (err) {
                                    console.log("algorithm -> deleteType -> update", err)
                                    defer.reject(err.message);
                                    return;
                                }
                                else {
                                    defer.resolve("HAHA");
                                }
                            }
                        );
                    }
                    else {
                        defer.resolve("HAHA");
                    }
                }
            }
        );
        return defer.promise;
    },
    delete: function(connection, id) {
        var defer = q.defer();
        console.log("algorithm -> delete", id)
        connection.execute(
            "DELETE from algorithm WHERE ID=:id ",
            {
                id: id
            },
            {
                autoCommit: true
            },
            function(err, result) {
                if (err) {
                    console.log("algorithm -> deleteType", err)
                    defer.reject(err.message);
                    return;
                }
                else {
                    defer.resolve("HAHA");
                }
            }
        );
        return defer.promise;
    },
}