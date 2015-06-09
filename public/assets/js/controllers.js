var MisApp = angular.module('misapp');
function formatAlgGroup (groups) {
    // INPUT groups
    // [{
    //     GID: 
    //     GNAME:
    //     ID:
    //     NAME:
    //     CLASSPATH:
    //     PARAMTYPES:
    //     PARAMNAMES:
    // }]
    var groupsById = _.groupBy(groups, 'GROUPID');
    return _.map(groupsById, function(gs) {
        if (gs[0].GID === gs[0].GROUPID) {
            return {
                id: gs[0].GROUPID,
                name: gs[0].GNAME,
                children: gs
            }
        }
        else {
            return {
                id: gs[0].GROUPID,
                name: gs[0].GNAME,
                children: []
            }
        }
    });
    // OUTPUT [{
    //     id: 
    //     name:
    //     children: [{
    //         ID: 
    //         NAME:
    //         GID:
    //         GNAME:
    //         CLASSPATH:
    //         PARAMNAMES:
    //         PARAMTYPES
    //     }]
    // }]
};
MisApp.controller('ProfileModalInstanceCtrl', function ($scope, $modalInstance, user, title, UserService) {
	$scope.user = user.user;
    $scope.companies = user.companies;
    $scope.departments = user.departments;
	$scope.title = title;
    $scope.isLoading = false;
    $scope.handleDepartmentChanged = function() {
        var department = $scope.user.DEPARTMENTID;
        $scope.user.DEPARTMENTID = department.ID;
        $scope.user.DEPARTMENTNAME = department.DEPARTMENTNAME;
    };
    $scope.handleCompanyChanged = function() {
        $scope.isLoading = true;
        var company = $scope.user.COMPANYID;
        $scope.user.COMPANYNAME = company.COMPANYNAME;
        $scope.user.COMPANYID = company.ID;
        UserService.getDepartments({companyId: company.ID}).then(function(data) {
            $scope.departments = data;
            $scope.isLoading = false;
            $scope.user.DEPARTMENTNAME = "";
            $scope.user.DEPARTMENTID = null;
        }, function(err) {
            console.log("ProfileModalInstanceCtrl -> handleCompanyChanged", err)
        })
    };
	$scope.ok = function () {
        if ($scope.user.ID) {
            if ($scope.user.DEPARTMENTID && $scope.user.COMPANYID) {
                UserService.patchUser($scope.user).then(function(data) {
                    console.log("ProfileModalInstanceCtrl -> ok -> patchUser", data);
                    $modalInstance.close($scope.user);
                }, function(err) {
                    console.log("ProfileModalInstanceCtrl -> ok -> patchUser", err);
                })
            }
            else {
                return;
            }
        }
        else {
            if (!$scope.user.PASSWORD || !$scope.user.LOGINNAME) {
                return;
            }
            var hash = CryptoJS.MD5($scope.user.PASSWORD);
            $scope.user.PASSWORD = hash.toString(CryptoJS.enc.Base64);
            UserService.postUser($scope.user).then(function(data) {
                console.log("ProfileModalInstanceCtrl -> ok -> postUser", data);
                $modalInstance.close(data);
            }, function(err) {
                console.log("ProfileModalInstanceCtrl -> ok -> patchUser", err);
            })
        }
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});

MisApp.controller('MainCtrl', function ($scope, $stateParams, UserService, $modal) {
    var userId = $stateParams.id;
    $scope.searchText = "";
    $scope.viewProfile = function() {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'assets/templates/profilemodal.html',
            controller: 'ProfileModalInstanceCtrl',
            resolve: {
                user: function() {
                    return UserService.getUser({userId: userId}).then(function(data) {
                        console.log(data)
                        return data;
                    }, function(err) {
                        console.log("MainCtrl -> viewProfile -> resolve -> user", err)
                        return err;
                    })
                },
                title: function() {
                    return "编辑信息";
                }
            }
        });

        modalInstance.result.then(function (user) {
            
        }, function(err) {
            console.log(err)
        })
    }
});

MisApp.controller('UsersCtrl', function ($scope, users, $modal, UserService, $stateParams) {
    $scope.isUser = true;
	var columnNames = ["id", "登录名", "姓名", "角色", "电话", "email", "地址", "介绍", "权限级别", "所属公司", "部门", "onoff"]
	var keys = ["ID", "LOGINNAME", "REALNAME", "POST", "PHONE", "EMAIL", "ADDRESS", "DESCRIPTION", "USERLEVEL", "COMPANYNAME", "DEPARTMENTNAME", "ONOFF"];
	$scope.headers = [];
    $scope.headerMap = {};
    for (var i in columnNames, keys) {
        $scope.headers.push({
            key: keys[i],
            columnName: columnNames[i]
        });
        $scope.headerMap[keys[i]] = columnNames[i];
    }
    $scope.enableDelete = true;
	$scope.items = _.values(users);
    $scope.buttonText = "添加用户";
    var insertion = [];
    var removal = [];
    $scope.viewAlgorithms = function(user) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'assets/templates/algoptionmodal.html',
            controller: 'AlgOptionsModalInstanceCtrl',
            size: 'lg',
            resolve: {
                user: function() {
                    return Object.create(user);
                },
                algorithms: function(AlgorithmService) {
                    return AlgorithmService.getList({userId: $stateParams.id}).then(function(data) {
                        return formatAlgGroup(data);
                    }, function(err) {
                        return err;
                    })
                },
                title: function() {
                    return "编辑用户算法权限";
                }
            }
        });

        modalInstance.result.then(function (algorithms) {
            console.log("UsersCtrl -> viewAlgorithms -> result", algorithms)
            var index = _.findIndex($scope.items, function(u) {
                return u.ID === user.ID;
            });
            $scope.items[index].algorithms = algorithms;
        }, function(err) {
            console.log(err)
        })
    }
    $scope.handleClick = function(user) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'assets/templates/profilemodal.html',
            controller: 'ProfileModalInstanceCtrl',
            resolve: {
                user: function() {
                	return UserService.getUser({userId: user.ID}).then(function(data) {
                        console.log(data)
                        return data;
                    }, function(err) {
                        console.log("UsersCtrl -> handleClick -> resolve -> user", err)
                        return err;
                    })
                },
                title: function() {
                	return "编辑用户信息";
                }
            }
        });

        modalInstance.result.then(function (user) {
            console.log("UsersCtrl -> handleClick -> result", user, $scope.items)
            var index = _.findIndex($scope.items, function(u) {
                return u.ID === user.ID;
            });
            $scope.items[index] = user;
        }, function(err) {
            console.log(err)
        })
    };
    $scope.add = function() {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'assets/templates/profilemodal.html',
            controller: 'ProfileModalInstanceCtrl',
            resolve: {
                user: function() {
                    return UserService.getCompanies().then(function(data) {
                        console.log(data)
                        var res = {};
                        res.user = {
                            REALNAME: "",
                            LOGINNAME: "",
                            COMPANYID: null,
                            COMPANYNAME: null,
                            DEPARTMENTNAME: null,
                            DEPARTMENTID: null,
                            ADDRESS: "",
                            PHONE: "",
                            EMAIL: "",
                            PASSWORD: "",
                            ONOFF: "",
                            POST: "",
                            DESCRIPTION: "",
                            USERLEVEL: ""
                        };
                        res.companies = data;
                        res.departments = [];
                        return res;
                    }, function(err) {
                        console.log("UsersCtrl -> add -> resolve -> user", err)
                        return err;
                    })
                },
                title: function() {
                    return "添加用户";
                }
            }
        });

        modalInstance.result.then(function (users) {
            console.log("UsersCtrl -> handleClick -> result", users, $scope.items)
            $scope.items = users;
        }, function(err) {
            console.log(err)
        })
    };
    $scope.handleDelete = function(user) {
        UserService.deleteUser({id: user.ID}).then(function() {
            var index = _.findIndex($scope.items, function(u) {
                return u.ID === user.ID;
            });
            $scope.items.splice(index, 1);
        }, function(err) {
            console.log("UsersCtrl -> handleDelete -> UserService -> deleteUser", err)
        })
    }
});

MisApp.controller('RecordsCtrl', function ($scope, records, $modal, RecordService) {
    var columnNames = ["id", "任务名", "执行者", "算法名称", "开始时间", "持续时间", "结果地址", "类型"]
    var keys = ["id", "taskname", "user", "algname", "starttime", "lasttime", "resultpath", "type"];
    $scope.headers = [];
    $scope.isUser = false;
    $scope.headerMap = {};
    for (var i in columnNames, keys) {
        $scope.headers.push({
            key: keys[i],
            columnName: columnNames[i]
        });
        $scope.headerMap[keys[i]] = columnNames[i];
    }
    $scope.items = records;
    $scope.enableDelete = true;
    $scope.buttonText = "刷新";
    $scope.handleDelete = function(record) {
        RecordService.deleteRecord(record.id).then(function() {
            var index = _.findIndex($scope.items, function(u) {
                return u.id === record.id;
            });
            $scope.items.splice(index, 1);
        }, function(err) {
            console.log("RecordsCtrl -> handleDelete -> RecordService -> deleteRecord", err)
        })
    };
    $scope.handleClick = function(record) {};
    $scope.add = function() {
        $scope.buttonText = "刷新中...";
        RecordService.getRecords().then(function(data) {
            $scope.buttonText = "刷新";
            $scope.records = data;
            return data;
        }, function(err) {
            $scope.buttonText = "刷新";
            return err;
        })
    }
});