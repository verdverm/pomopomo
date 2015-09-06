angular.module("pomodoroTodoApp")

.controller("TodoListController",
    function($rootScope, $scope, $location, $mdDialog, $mdToast, authService, todoService) {

        var self = this;
        self.todos = [];

        self.newTodo = newTodo;

        // watch todoServices for changes in todos
        $scope.todoSrvc = todoService;
        $scope.$watch('todoSrvc.numTodos()', function(newVal) {
            console.log("todos update: ", newVal)
            self.todos = todoService.getTodos();


            if (self.todos.length === 0) {
                var r = Math.floor(Math.random() * 11)
                var urlString = 'assets/img/nothing/sisyphus-' + r + '.jpg';
                self.urlString = urlString;
                console.log("nada todo: ", self.urlString);
            } else {
                console.log("something todo")
                self.urlString = "";
            }
        });

        // load user's todo, but not until we are authed
        // we need this because a user can directly navigate to this page
        $scope.auth = authService;
        $scope.$watch('auth.authed()', function(newVal) {
            console.log("authed update: ", newVal)

            if (newVal === false) {
                return
            }
            todoService.loadTodos()
                .then(function(todos) {
                    console.log("todos loaded: ", todos)
                }, function(reason) {
                    alert('Retrieving todos failed: ' + reason);
                });
        })




        function newTodo(event) {
            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: '/src/todos/views/todo-new-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true
                })
                .then(function(todo) {
                    console.log("new todo: ", todo)

                    if (todo.Name === "") {
                        $mdToast.show($mdToast.simple().content("unable to create todo :[\n" + "empty name"));
                        return;
                    }

                    todoService.saveNewTodo(todo)
                        .then(
                            function success(data) {
                                $mdToast.show($mdToast.simple().content('todo created :]'));
                            },
                            function(error) {
                                $mdToast.show($mdToast.simple().content("unable to create todo :[\n" + error.Error));
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
