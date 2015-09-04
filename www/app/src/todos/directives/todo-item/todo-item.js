angular.module("pomodoroTodoApp")

.directive('todoItem', function() {
    return {
        restrict: 'E',
        templateUrl: '/src/todos/directives/todo-item/todo-item.html',
        scope: {
            todo: "=",
        },
        link: function(scope, element, attrs, parentCtrl) {
            // do init stuff here

        },

    }
})

.controller("TodoItemController", function($rootScope, $scope, $location) {
    var self = $scope;

    self.gotoTodo = function(event, tid) {
        $location.path("/todo/" + tid)
    }

    self.deleteTodo = function(event, tid) {
        alert("deleting todo!!")
    }

})