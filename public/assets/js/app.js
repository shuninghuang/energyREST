var MisApp = angular.module('misapp', ['ui.router', 'ui.bootstrap']);
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
MisApp.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
	$httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Accept"] = "application/json";
    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
	$urlRouterProvider.otherwise("/");
	$stateProvider
    .state('authentication', {
		url: "/",
		templateUrl: "../index.html"
    })
    .state('main', {
    	abstract: true,
        url: '/main/:id',
        templateUrl: "../assets/templates/main.html",
        controller: 'MainCtrl'
    })
    .state('main.users', {
    	url: "/users",
    	templateUrl: "../assets/templates/customtable.html",
    	resolve: {
    		users: function(UserService) {
    			return UserService.getUsers().then(function(data) {
    				return data;
    			}, function(err) {
    				return err;
    			})
    		}
    	},
    	controller: 'UsersCtrl'
	})
	.state('main.algorithms', {
		url: "/algorithms",
		templateUrl: "../assets/templates/groupingtable.html",
        controller: 'AlgorithmsCtrl',
        resolve: {
            groups: function(AlgorithmService, $stateParams) {
                return AlgorithmService.getList({userId: $stateParams.id}).then(function(data) {
                    return formatAlgGroup(data);
                }, function(err) {
                    return err;
                })
            }
        }
	})
	.state('main.records', {
    	url: "/records",
    	templateUrl: "../assets/templates/customtable.html",
        resolve: {
            records: function(RecordService) {
                return RecordService.getRecords().then(function(data) {
                    return data;
                }, function(err) {
                    return err;
                })
            }
        },
        controller: 'RecordsCtrl'
	})
});