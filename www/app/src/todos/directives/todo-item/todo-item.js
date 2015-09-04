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

.controller("TodoItemController", function($rootScope, $scope, $location, todoService) {
    var self = $scope;

    self.todoClicked = function(event) {
        console.log("todoClicked: ", event);
        var pass = clickbuster.onClick(event);
        if (!pass) {
            return;
        }

        console.log("todo clicked", self.todo)
    }

    self.createAlarm = function(event) {
        console.log("createAlarm: ", event);
        var pass = clickbuster.onClick(event);
        if (!pass) {
            return;
        }
        
        alert("BLUE TOMATOES!!!")
    }

    self.deleteTodo = function(event) {
        console.log("deleteTodo: ", event);
        var pass = clickbuster.onClick(event);
        if (!pass) {
            return;
        }
        
        var yes = confirm("Are you sure you want to delete this todo?");

        if(yes === false) {
            return;
        }
        console.log("deleting...");

        todoService.deleteTodo(self.todo)

    }

})