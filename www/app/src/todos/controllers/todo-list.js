angular.module("pomodoroTodoApp")
    
.controller("TodoListController", 
    function($rootScope, $scope, $location, todoService) {

		var self = this;

		var promise = todoService.getAllTodos();

		promise.then(function(todos) {
			self.todos = todos;
			console.log("todos received: ", todos)
		}, function(reason) {
			alert('Retrieving todos failed: ' + reason);
		});

    }
);