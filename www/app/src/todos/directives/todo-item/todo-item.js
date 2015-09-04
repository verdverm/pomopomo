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

    self.showDetails = false;
    self.showEditable = false;


    self.toggleDetails = function(event) {
        var pass = clickbuster.onClick(event);
        if (!pass) {
            return;
        }

        self.showDetails = !self.showDetails;

        console.log("show details ? ", self.showDetails)

    }

    self.toggleEditing = function(event) {
        var pass = clickbuster.onClick(event);
        if (!pass) {
            return;
        }
        // not sure why, but this is the only icon handler clicking through
        // and triggering the details as well...

        self.showDetails = !self.showDetails;
        self.showEditable = !self.showEditable;

        console.log("show editing ? ", self.showEditable)

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