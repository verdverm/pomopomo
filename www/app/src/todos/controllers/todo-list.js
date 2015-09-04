angular.module("pomodoroTodoApp")
    
.controller("TodoListController", 
    function($rootScope, $scope, $location, todoService) {

      var self = this;

      self.todos = todoService.getAllTodos();

    }
);