var oracledb = require('oracledb');
var q = require('q');

module.exports = function(func, params) {
    var deferred = q.defer();
    oracledb.createPool(
        {
            user          : "tseg",
            password      : "tseg",
            connectString : "enegry",
            poolMax: 20
        },
        function(err, pool) {
            if (err) {
                console.log("1", err)
                deferred.reject(err.message);
            }
            else {
                pool.getConnection(
                    function(err, connection) {
                        if (err) {
                            console.log("2", err)
                            deferred.reject(err.message);
                        }
                        deferred.resolve(connection);
                    }
                )
            }
        }
    );
    return deferred.promise;
}