var database = require('./data.js');
var Algorithm = require('./models/algorithm');
var User = require('./models/user');
var Company = require('./models/company');
var Department = require('./models/department');
var Record = require('./models/record');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

module.exports = function(app) {
	app.get('/api/algorithms/types', function(req, res) {
	   	database().then(function(conn) {
			return Algorithm.getTypes(conn).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						res.status(500).send(err);
					});
		}, function(err) {
			res.status(500).send(err);
		})
	});
	app.get('/api/:userId/algorithms', function(req, res) {
	   	database().then(function(conn) {
			return Algorithm.getList(conn, req.params.userId).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						res.status(500).send(err);
					});
		}, function(err) {
			res.status(500).send(err);
		})
	});
	app.post('/api/algorithms/type/new', jsonParser, function(req, res) {
	   	database().then(function(conn) {
			return Algorithm.createType(conn, req.body.name).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						res.status(500).send(err);
					});
		}, function(err) {
			res.status(500).send(err);
		})
	});
	app.post('/api/:userId/algorithms/new', jsonParser, function(req, res) {
	   	database().then(function(conn) {
			return Algorithm.create(conn, req.params.userId, req.body).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						res.status(500).send(err);
					});
		}, function(err) {
			res.status(500).send(err);
		})
	});
	app.put('/api/:userId/algorithms/:algorithmId/update', jsonParser, function(req, res) {
	   	database().then(function(conn) {
			return Algorithm.update(conn, req.body)
				.then(function(data) {
					return Algorithm.getList(conn, req.params.userId);
				}, function(err) {
					res.status(500).send(err);
				})
				.then(function(data) {
					conn.release(
                        function(err) {
                            console.error("release", err);
                            return;
                        });
					res.json(data);
				}, function(err) {
					res.status(500).send(err);
				});
		}, function(err) {
			res.status(500).send(err);
		})
	});
	app.put('/api/algorithms/type/:typeId/update', jsonParser, function(req, res) {
	   	database().then(function(conn) {
			return Algorithm.updateType(conn, req.params.typeId, req.body)
				.then(function(data) {
					conn.release(
                        function(err) {
                            console.error("release", err);
                            return;
                        });
					res.json(data);
				}, function(err) {
					res.status(500).send(err);
				});
		}, function(err) {
			res.status(500).send(err);
		})
	});
	app.put('/api/algorithms/type/:typeId', jsonParser, function(req, res) {
		console.log("routes -> deleteType", req.body)
	   	database().then(function(conn) {
			return Algorithm.deleteType(conn, req.params.typeId, req.body)
				.then(function(data) {
					conn.release(
                        function(err) {
                            console.error("release", err);
                            return;
                        });
					res.json(data);
				}, function(err) {
					res.status(500).send(err);
				});
		}, function(err) {
			res.status(500).send(err);
		})
	});
	app.delete('/api/algorithms/:algorithmId', function(req, res) {
		console.log(req.params.algorithmId)
	   	database().then(function(conn) {
			return Algorithm.delete(conn, req.params.algorithmId)
				.then(function(data) {
					conn.release(
                        function(err) {
                            console.error("release", err);
                            return;
                        });
					res.json(data);
				}, function(err) {
					res.status(500).send(err);
				});
		}, function(err) {
			res.status(500).send(err);
		})
	});

	/* users apis */

	// get all users
	app.get('/api/users', function(req, res) {
	   	database().then(function(conn) {
			return User.getList(conn).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						res.status(500).send(err);
					});
		}, function(err) {
			res.status(500).send(err);
		})
	});
	// get a particular user
	app.get('/api/users/:userId/profile', function(req, res) {
	   	database().then(function(conn) {
	   		var response = {};
			return User.getUser(conn, req.params.userId).then(function(data) {
						response['user'] = data;
						return Company.getList(conn);
					}, function(err) {
						console.log("routes -> getUser -> User -> getUser", err)
						res.status(500).send(err);
					})
					.then(function(data) {
						response['companies'] = data;
						return Department.getList(conn, response.user.COMPANYID);
					}, function(err) {
						console.log("routes -> getUser -> Company -> getList", err)
						res.status(500).send(err);
					})
					.then(function(data) {
						response['departments'] = data;
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(response);
					}, function(err) {
						console.log("routes -> getUser -> Department -> getList", err)
						res.status(500).send(err);
					})
		}, function(err) {
			res.status(500).send(err);
		})
	});
	// login
	app.post('/api/users/login', jsonParser, function(req, res) {
		database().then(function(conn) {
			return User.auth(conn, req.body.name, req.body.psw).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						res.status(401).send(err);
					});
		}, function(err) {
			res.status(401).send(err);
		})
	});
	// update a particular user
	app.put('/api/users/:userId/profile/update', jsonParser, function(req, res) {
		database().then(function(conn) {
			return User.update(conn, req.body).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						console.log("routes -> patchuser -> update", err)
						res.status(500).send(err);
					});
		}, function(err) {
			console.log("routes -> patchuser -> database", err)
			res.status(500).send(err);
		})
	});
	// update granted algorithms for a particular user
	app.put('/api/users/:userId/algorithms/update', jsonParser, function(req, res) {
		console.log("routes -> grant", req.params.userId, req.body)
		database().then(function(conn) {
			return User.grant(conn, req.params.userId, req.body).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						res.status(500).send(err);
					});
		}, function(err) {
			console.log("routes -> grant", err)
			res.status(500).send(err);
		})
	});
	// post a user
	app.post('/api/users/new', jsonParser, function(req, res) {
		database().then(function(conn) {
			return User.post(conn, req.body).then(function(data) {
						return User.getList(conn);
					}, function(err) {
						console.log("routes -> postuser -> post", err)
						res.status(500).send(err);
					})
					.then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						res.status(500).send(err);
					});
		}, function(err) {
			console.log("routes -> postuser -> database", err)
			res.status(500).send(err);
		})
	});
	// delete user
	app.delete('/api/users/:userId', function(req, res) {
		database().then(function(conn) {
			return User.delete(conn, req.params.userId).then(function(data) {
                        conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						console.log("routes -> deleteuser -> delete", err)
						res.status(500).send(err);
					});
		}, function(err) {
			console.log("routes -> deleteuser -> delete", err)
			res.status(500).send(err);
		})
	})
	// get departments
	app.get('/api/users/loading/:companyId', function(req, res) {
		database().then(function(conn) {
			return Department.getList(conn, req.params.companyId).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						console.log("routes -> getDepartments", err)
						res.status(500).send(err);
					});
		}, function(err) {
			console.log("routes -> getDepartments", err)
			res.status(500).send(err);
		})
	});
	// get companies
	app.get('/api/users/new', function(req, res) {
		database().then(function(conn) {
			var response = {}
			return Company.getList(conn).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						console.log("routes -> getCompanies -> getList", err)
						res.status(500).send(err);
					});
		}, function(err) {
			console.log("routes -> getCompanies", err)
			res.status(500).send(err);
		})
	});

	/* record apis */
	app.get('/api/records', function(req, res) {
	   	database().then(function(conn) {
			return Record.getList(conn).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						res.status(500).send(err);
					});
		}, function(err) {
			res.status(500).send(err);
		})
	});
	app.delete('/api/records/:id', function(req, res) {
	   	database().then(function(conn) {
			return Record.delete(conn, req.params.id).then(function(data) {
						conn.release(
                            function(err) {
                                console.error("release", err);
                                return;
                            });
						res.json(data);
					}, function(err) {
						res.status(500).send(err);
					});
		}, function(err) {
			res.status(500).send(err);
		})
	});
}