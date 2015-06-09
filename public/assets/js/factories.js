var MisApp = angular.module('misapp');
var domain = "http://10.108.217.190:7070/energyREST";
// var domain = "http://localhost:8080";
MisApp.factory('UserService', function ($http, $q) {
	return {
		auth: function(params) {
			return $http.post('/api/users/login', params)
				.then(function (resp) {
					if (resp.status === 200) {
						return resp.data;
					}
					else {
	                    return $q.reject(resp);
	                }
	            }, function(response) {
                    return $q.reject(response.data);
                })
		},
        getUsers: function() {
            return $http.get('/api/users')
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        getUser: function(params) {
            return $http.get('/api/users/' + params.userId + '/profile')
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        getDepartments: function(params) {
            return $http.get('/api/users/loading/' + params.companyId)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        getCompanies: function(params) {
            return $http.get('/api/users/new')
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        postUser: function(params) {
            return $http.post('/api/users/new', params)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        patchUser: function(params) {
            return $http.put('/api/users/' + params.id + '/profile/update', params)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        grantUser: function(userId, params) {
            return $http.put('/api/users/' + userId + '/algorithms/update', params)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        deleteUser: function(params) {
            return $http.delete('/api/users/' + params.id)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        }
	}
});

MisApp.factory('RecordService', function ($http, $q) {
    return {
        getRecords: function() {
            return $http.get('/api/records')
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        deleteRecord: function(id) {
            return $http.delete('/api/records/' + id)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        }
    }
});

MisApp.factory('AlgorithmService', function ($http, $q) {
    return {
        getList: function(params) {
            return $http.get('/api/' + params.userId + '/algorithms')
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        getTypes: function() {
            return $http.get('/api/algorithms/types')
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        getAlgorithms: function() {
            return $http.get('/api/algorithms') // your url
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        postType: function(params) {
            return $http.post('/api/algorithms/type/new', params)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        post: function(userId, params) {
            return $http.post('/api/' + userId + '/algorithms/new', params)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        patch: function(userId, params) {
            return $http.put('/api/' + userId + '/algorithms/' + params.ID + '/update', params)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        patchType: function(params) {
            return $http.put('/api/algorithms/type/' + params.id + '/update', params)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        deleteType: function(params, typeId) {
            return $http.put('/api/algorithms/type/' + typeId, params)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        delete: function(id) {
            return $http.delete('/api/algorithms/' + id)
                .then(function (resp) {
                    if (resp.status === 200) {
                        return resp.data;
                    }
                    else {
                        return $q.reject(resp);
                    }
                }, function(response) {
                    return $q.reject(response);
                })
        },
        executeAlgorithm: function(userId, taskName, algorithm, params) {
            var args = {
                "classPath": algorithm.CLASSPATH,
                "taskName": taskName,
                "params": params
            };
            console.log("executeAlgorithm", args);
            return $http.post(domain + '/api/' + userId + '/algorithms/' + algorithm.ID, args)      
            .then(function (resp) {
                if (resp.status === 200) {
                    console.log("daa", resp.data.data)
                    return resp.data.data;
                }
                else {
                    return $q.reject(resp);
                }
            }, function(response) {
                return $q.reject(response);
            })
                
        }
    };
});