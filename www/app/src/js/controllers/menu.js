angular.module("pomodoroTodoApp")

.controller("MenuController", 
    function($scope, $location, $mdSidenav, authService, todoService) {

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
    	self.newTodo = newTodo;
    	self.logout = logout;




    	function toggleMenu() {
        	$mdSidenav('left').toggle();
        }

        function newTodo() {
        	console.log("Creating new Todo");

        	var todo = {
        		"Name": "todo E",
        		"Description": "todo E description"
        	}

        	todoService.saveNewTodo(todo);
        }

        function logout() {
        	authService.logout();
        	$location.path("/");
        }


	})