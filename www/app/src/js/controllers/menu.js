angular.module("pomodoroTodoApp")

.controller("MenuController", 
    function($scope, $location, $state, $mdSidenav, authService, todoService) {

    	var self = this;

    	// The following is for watching the auth status and presenting a boolean for the UI to adjust itself
    	self.showLogout = false;
	    $scope.auth = authService
	    $scope.$watch('auth.authed()', function(newVal) {
	        console.log("authed update: ", newVal)
	        self.showLogout = newVal;
	    })


	    // Menu functions
    	self.toggleMenu = toggleMenu;
        self.gotoHome = gotoHome;
        self.gotoTodos = gotoTodos;
    	self.logout = logout;


    	function toggleMenu() {
        	$mdSidenav('left').toggle();
        }

        function gotoHome() {
            $mdSidenav('left').close();
            $state.go("index")
        }

        function gotoTodos() {
            $mdSidenav('left').close();
            $state.go("main")
        }

        function logout() {
            $mdSidenav('left').close();
        	authService.logout();

        	$location.path("/");
        }


	});