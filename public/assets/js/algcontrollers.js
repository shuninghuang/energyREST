var MisApp = angular.module('misapp');

var types = ["number", "text"]
function formatAlgGroup (groups) {
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
};
MisApp.controller('AlgOptionsModalInstanceCtrl', function ($scope, algorithms, user, title, $modalInstance, UserService) {
    var grantedAlgs = _.pluck(user.algorithms, 'id');
    $scope.title = title;
    $scope.groups = _.map(algorithms, function(g) {
        g.checked = false;
        _.forEach(g.children, function(c) {
            if (grantedAlgs.indexOf(c.ID) === -1) {
                c.checked = false;
            }
            else {
                c.checked = true;
            }
        });
        return g;
    });
    $scope.checked = false;
    $scope.checkedAll = function() {
        var checked = $scope.checked;
        $scope.groups = _.map(algorithms, function(g) {
            g.checked = checked;
            _.forEach(g.children, function(c) {
                if (grantedAlgs.indexOf(c.ID) === -1) {
                    c.checked = checked;
                }
                else {
                    c.checked = checked;
                }
            });
            return g;
        });
    }
    $scope.handleChecked = function(item) {
        if (item.GID) {
            var index = _.findIndex($scope.groups, function(g) {
                return g.id === item.GID;
            });
            if (!item.checked) {
                $scope.groups[index].checked = false;
                $scope.checked = false;
            }
        }
        else {
            if (item.checked) {
                _.forEach(item.children, function(c) {
                    c.checked = true;
                })
            }
            else {
                _.forEach(item.children, function(c) {
                    c.checked = false;
                })
            }
        }   
    };
    $scope.ok = function() {
        var checkedItems = [];
        _.forEach($scope.groups, function(g) {
            _.forEach(g.children, function(c) {
                if (c.checked) {
                    checkedItems.push({id: c.ID, name: c.NAME})
                }
            });
        });
        var insertion = _.difference(_.pluck(checkedItems, 'id'), grantedAlgs);
        var removal = _.difference(grantedAlgs, _.pluck(checkedItems, 'id'));
        UserService.grantUser(user.ID, {insertion: insertion, removal: removal})
        .then(function(data) {
            $modalInstance.close(checkedItems);
        }, function(err) {
            console.log("AlgOptionsModalInstanceCtrl -> ok -> err", err);
            return err;
        })
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    }
});

MisApp.controller('AlgExeModalInstanceCtrl', function ($scope, algorithm, $modalInstance, userId) {
    $scope.algorithm = algorithm;
    $scope.taskName = "";
    var paramnames = algorithm.PARAMNAMES.split(', ')
    var paramtypes = algorithm.PARAMTYPES.split(', ');
    var params = [];
    for (var i in paramnames, paramtypes) {
        params.push({
            name: paramnames[i],
            type: paramtypes[i],
            value: ""
        });
    }
    $scope.params = params;
    $scope.types = types;
    $scope.title = "执行算法";
    $scope.ok = function(form) {
        if (form.$valid) {
            form.$setPristine();
            form.$setUntouched();
            var args = _.pluck($scope.params, 'value');
            AlgorithmService.executeAlgorithm(userId, $scope.taskName, algorithm, args).then(function(data) {
                $modalInstance.close(data);
            }, function(err) {
                alert(err);
            })
        }
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    }
});

MisApp.controller('AlgModalInstanceCtrl', function ($scope, algorithm, $modalInstance, AlgorithmService, userId, groups, title) {
    $scope.algorithm = algorithm;
    $scope.groups = groups;
    $scope.title = title + "(严格按照算法所要求的参数输入顺序)";
    var paramnames = algorithm.PARAMNAMES.split(', ');
    var paramtypes = algorithm.PARAMTYPES.split(', ');
    var params = [];
    for (var i in paramnames, paramtypes) {
        params.push({
            name: paramnames[i],
            type: paramtypes[i]
        });
    }
    $scope.params = params;
    $scope.types = types;
    $scope.alert = {
        msg: "",
        type: 'danger'
    };
    $scope.add = function() {
        $scope.params.push({name: "", type: "text"});
    };
    $scope.remove = function(index) {
        if ($scope.params.length !== 1) {
            $scope.params.splice(index, 1);
        }
        else {
            $scope.params[0] = {
                name: "",
                type: ""
            }
        }
    };
    $scope.ok = function() {
        if (_.filter(_.pluck($scope.params, 'name'), function(datum) { return datum === ""; }).length === 0 && $scope.algorithm.NAME) {
            $scope.algorithm.PARAMNAMES = _.pluck($scope.params, 'name').join(', ');
            $scope.algorithm.PARAMTYPES = _.pluck($scope.params, 'type').join(', ');
            if ($scope.algorithm.ID) {
                AlgorithmService.patch(userId, $scope.algorithm).then(function(data) {
                    $modalInstance.close(data);
                }, function(err) {
                    $scope.alert.msg = err;
                })
            }
            else {
                AlgorithmService.post(userId, $scope.algorithm).then(function(data) {
                    $scope.algorithm.ID = data;
                    $modalInstance.close($scope.algorithm);
                }, function(err) {
                    $scope.alert.msg = err;
                })
            }
        }
        else {
            $scope.alert.msg = "不能有空！";
        }
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    }
});

MisApp.controller('AlgTypeModalInstanceCtrl', function ($scope, group, title, $modalInstance, AlgorithmService) {
    $scope.group = group;
    $scope.alert = {
        type: 'danger',
        msg: ''
    };
    $scope.title = title;
    $scope.ok = function() {
        if (group.id) {
            AlgorithmService.patchType($scope.group).then(function(data) {
                $modalInstance.close($scope.group);
            }, function(err) {
                $scope.alert.msg = err;
            })
        }
        else {
            AlgorithmService.postType({name: $scope.group.name}).then(function(data) {
                $scope.group.id = data;
                $modalInstance.close($scope.group);
            }, function(err) {
                $scope.alert.msg = err;
            })
        }
    }
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    }
});

MisApp.controller('AlgorithmsCtrl', function ($scope, $modal, groups, $stateParams, AlgorithmService) {
    var columnNames = ["算法名称", "类路径"]
    var keys = ["NAME", "CLASSPATH"];
    $scope.headers = [];
    $scope.headerMap = {};
    for (var i in columnNames, keys) {
        $scope.headers.push({
            key: keys[i],
            columnName: columnNames[i]
        });
        $scope.headerMap[keys[i]] = columnNames[i];
    }
    $scope.selected = "";
    $scope.groups = groups;
    $scope.enableDelete = true;
    $scope.buttonText = "添加无分类算法";
    $scope.alert = {
        msg: "",
        type: 'danger'
    }
    $scope.open = function(groupId) {
        $scope.selected = groupId;
        var index = _.findIndex($scope.groups, function(g) {
            return g.id === groupId;
        });
        if (index !== -1) {
            $scope.groups[index].open = !$scope.groups[index].open;
            $scope.buttonText = "添加算法到" + $scope.groups[index].name;
        }
    }
    $scope.handleDelete = function(item, group) {
        if (item.children) {
            var root = _.find($scope.groups, function(g) { return g.name === 'root'; });
            var childrenIds = _.pluck(item.children, 'ID');
            AlgorithmService.deleteType({rootId: root.id, childrenIds: childrenIds}, item.id).then(function(data) {
                root.children = root.children.concat(item.children);
                var index = _.findIndex($scope.groups, function(g) { return g.id === item.id; });
                $scope.groups.splice(index, 1);
            }, function(err) {
                $scope.alert.msg = "删除失败, err " + err;
            })
        }
        else  {
            AlgorithmService.delete(item.ID).then(function(data) {
                var index = _.findIndex(group.children, function(c) { return c.ID === item.ID; });
                group.children.splice(index, 1);
            }, function(err) {
                $scope.alert.msg = "删除失败, err " + err;
            })
        }
    };
    $scope.execute = function(item) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'assets/templates/paramsmodal.html',
            controller: 'AlgExeModalInstanceCtrl',
            resolve: {
                algorithm: function () {
                    return JSON.parse(JSON.stringify(item));
                },
                userId: function() {
                    return $stateParams.id;
                }
            }
        });
        
        modalInstance.result.then(function (data) {
            alert(data);
        }, function(err) {
            alert(err);
        })
    };
    $scope.handleClick = function(item) {
        if (item.children) {
            $scope.selected = item.id;
            $scope.buttonText = "添加" + item.name + "算法";
            var modalInstance = $modal.open({
                animation: true,
                template: '<div class="profile">'
                        +   '<div class="modal-header">'
                        +       '<h3 class="modal-title">{{title}}</h3>'
                        +   '</div>'
                        +   '<div class="modal-body">'
                        +       '<alert ng-if="alert.msg" type="{{alert.type}}" close="alert.msg=\'\'">{{alert.msg}}</alert>'
                        +       '<form role="form">'
                        +           '<div class="form-group">'
                        +               '<label for="name">类型名称</label>'
                        +               '<input type="name" class="form-control" ng-model="group.name" id="name" required/>'
                        +           '</div>'
                        +       '</form>'
                        +   '</div>'
                        +   '<div class="modal-footer">'
                        +       '<input type="submit" class="classic-input" ng-click="ok()" value="保存">'
                        +       '<input type="submit" class="classic-input cancel" ng-click="cancel()" value="取消">'
                        +   '</div>'
                        +'</div>',
                controller: 'AlgTypeModalInstanceCtrl',
                size: 'sm',
                resolve: {
                    group: function() {
                        return JSON.parse(JSON.stringify(item));
                    },
                    title: function() {
                        return "编辑算法类型";
                    }
                }
            });
            modalInstance.result.then(function(group) {
                item.name = group.name;
            }, function(err) {
                console.log(err);
            })
        }
        else {
            $scope.selected = "";
            $scope.buttonText = "添加无分类算法";
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'assets/templates/algmodal.html',
                controller: 'AlgModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    algorithm: function () {
                        return JSON.parse(JSON.stringify(item));
                    },
                    userId: function() {
                        return $stateParams.id;
                    },
                    groups: function() {
                        return AlgorithmService.getTypes().then(function(data) {
                            return data;
                        }, function(err) {
                            console.log(err);
                        })
                    },
                    title: function() {
                        return "编辑算法";
                    }
                }
            });
            modalInstance.result.then(function(groups) {
                $scope.groups = formatAlgGroup(groups);
            }, function(err) {
                console.log(err);
            }) 
        }
    };
    $scope.addType = function() {
        var modalInstance = $modal.open({
            animation: true,
            template: '<div class="profile">'
                        +   '<div class="modal-header">'
                        +       '<h3 class="modal-title">{{title}}</h3>'
                        +   '</div>'
                        +   '<div class="modal-body">'
                        +       '<alert ng-if="alert.msg" type="{{alert.type}}" close="alert.msg=\'\'">{{alert.msg}}</alert>'
                        +       '<form role="form">'
                        +           '<div class="form-group">'
                        +               '<label for="name">类型名称</label>'
                        +               '<input type="name" class="form-control" ng-model="group.name" id="name" required/>'
                        +           '</div>'
                        +       '</form>'
                        +   '</div>'
                        +   '<div class="modal-footer">'
                        +       '<input type="submit" class="classic-input" ng-click="ok()" value="保存">'
                        +       '<input type="submit" class="classic-input cancel" ng-click="cancel()" value="取消">'
                        +   '</div>'
                        +'</div>',
            controller: 'AlgTypeModalInstanceCtrl',
            size: 'sm',
            resolve: {
                group: function () {
                    return {
                        name: "",
                        children: []
                    }
                },
                title: function() {
                    return "添加算法类型";
                }
            }
        });
        
        modalInstance.result.then(function (group) {
            console.log("AlgTypeModalInstanceCtrl -> addType -> result", group)
            $scope.groups.push(group)
        }, function(err) {
            console.log("AlgTypeModalInstanceCtrl -> addType -> result -> err", err)
        })
    };
    $scope.add = function() {
        var group = $scope.selected === "" ? _.find($scope.groups, function(datum) { return datum.name === "root"; }) : _.find($scope.groups, function(datum) { return datum.id === $scope.selected; });
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'assets/templates/algmodal.html',
            controller: 'AlgModalInstanceCtrl',
            size: 'lg',
            resolve: {
                algorithm: function() {
                    return {
                        GID: group.id,
                        GNAME: group.name,
                        ID: "",
                        NAME: "",
                        CLASSPATH: "",
                        PARAMTYPES: "text",
                        PARAMNAMES: "参数1"
                    }
                },
                userId: function() {
                    return $stateParams.id;
                },
                groups: function() {
                    return AlgorithmService.getTypes().then(function(data) {
                        return data;
                    }, function(err) {
                        console.log(err);
                    })
                },
                title: function() {
                    return "添加算法";
                }
            }
        });
        modalInstance.result.then(function (algorithm) {
            group.children.push(algorithm);
        }, function(err) {
            console.log(err)
        })
    }
});