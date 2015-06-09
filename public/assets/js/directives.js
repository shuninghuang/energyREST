var MisApp = angular.module('misapp');
MisApp.directive('comfirm', function($state, UserService) {
	return {
		templateUrl: 'assets/templates/comfirm.html',
		restrict: 'E',
		controller: function($scope, $http) {
			$scope.loginObj = {
				name: "",
				psw: ""
			};
			$scope.err = "";
			$scope.buttonText = "登陆";
			var isLoading = false;
			$scope.login = function() {
				$state.go('main.users', {id: 435});
				// $scope.err = "";
				// if (isLoading || !$scope.loginObj.name || !$scope.loginObj.psw) {
				// 	return;
				// }
				// else {
				// 	$scope.buttonText = "正在登陆，请稍后...";
				// 	isLoading = true;
				//     var data = $scope.loginObj;
				//     UserService.auth(data).then(function (data) {
				//     	$scope.buttonText = "登陆";
	   //                  $state.go('users', {id: data.id});
	   //          	}, function(err) {
	   //          		$scope.err = err;
	   //          		$scope.buttonText = "登陆";
	   //          		console.log("Error auth", err)
	   //          		return;
	   //          	})
				// }
			};
			$scope.onTextClick = function($event) {
				$event.target.select();
			}
		}
	}
});
