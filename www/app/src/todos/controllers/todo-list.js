angular.module("pomodoroTodoApp")
    
.controller("TodoListController", 
    function($rootScope, $scope, $location, $mdDialog, $mdToast, todoService) {

		var self = this;
		self.todos = [];

		self.newTodo = newTodo;

		

		var promise = todoService.getAllTodos();

		promise.then(function(todos) {
			self.todos = todos;
			console.log("todos received: ", todos)
		}, function(reason) {
			alert('Retrieving todos failed: ' + reason);
		});



		function newTodo(event) {
			$mdDialog.show({
		      controller: DialogController,
		      templateUrl: '/src/todos/views/todo-new-dialog.html',
		      parent: angular.element(document.body),
		      targetEvent: event,
		      clickOutsideToClose:true
		    })
		    .then(function(todo) {
		      console.log("new todo: ", todo)
		      
		      todoService.saveNewTodo(todo)
		      	.then(
                function success(data) {
                    $mdToast.show($mdToast.simple().content('todo created :]'));
                    self.showEditable = false;
                },
                function(error) {
                    $mdToast.show($mdToast.simple().content("unable to update todo :[\nsee console for details"));
                    console.log(error)
                });

		    }, function() {
		      console.log("dialog closed")
		    });
		}

		function DialogController($scope, $mdDialog) {
		  
		  $scope.todo = {
		  	Name: "",
		  	Description: ""
		  }

		  $scope.hide = function() {
		    $mdDialog.cancel();
		  };
		  $scope.cancel = function() {
		    $mdDialog.cancel();
		  };
		  $scope.create = function(answer) {
		    $mdDialog.hide($scope.todo);
		  };
		}

    }
);