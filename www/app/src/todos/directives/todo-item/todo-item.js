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

.controller("TodoItemController", function($rootScope, $scope, $location, $interval, $mdDialog, $mdToast, todoService) {
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

        // not sure why, but the icon handlers are clicking through
        // and triggering the details as well...
        self.showDetails = !self.showDetails;

        self.showEditable = !self.showEditable;

        console.log("show editing ? ", self.showEditable)

    }



    self.updateTodo = function(event) {
        console.log("updateTodo: ", event);
        var pass = clickbuster.onClick(event);
        if (!pass) {
            return;
        }

        todoService.updateTodo(self.todo)
            .then(
                function success(data) {
                    $mdToast.show($mdToast.simple().content('todo updated :]'));
                    self.showEditable = false;
                },
                function(error) {
                    $mdToast.show($mdToast.simple().content("unable to update todo :[\nsee console for details"));
                    console.log(error)
                });

    }

    self.deleteTodo = function(event) {
        console.log("deleteTodo: ", event);
        var pass = clickbuster.onClick(event);
        if (!pass) {
            return;
        }

        // not sure why, but the icon handlers are clicking through
        // and triggering the details as well...
        self.showDetails = !self.showDetails;


        var confirm = $mdDialog.confirm()
            .title('Would you like to delete your todo?')
            .content('You will not be able to undo this action.')
            .ariaLabel('Lucky day')
            .ok('Please do it!')
            .cancel('Cancel')
            .targetEvent(event);
        $mdDialog.show(confirm).then(function() {

            todoService.deleteTodo(self.todo)
                .then(
                    function success(data) {
                        $mdToast.show($mdToast.simple().content('todo deleted :]'));
                        self.showEditable = false;
                    },
                    function(error) {
                        $mdToast.show($mdToast.simple().content("unable to delete todo :[\nsee console for details"));
                        console.log(error)
                    });

        }, function() {
            console.log("user cancelled the delete")
        });

    }

    self.createAlarm = function(event) {
        var pass = clickbuster.onClick(event);
        if (!pass) {
            return;
        }
        console.log("createAlarm: ", event);

        // not sure why, but the icon handlers are clicking through
        // and triggering the details as well...
        self.showDetails = !self.showDetails;


        self.timerDialog = $mdDialog
        self.timerDialog.show({
                templateUrl: '/src/todos/views/todo-new-pomodoro.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                locals: {
                    parent: self
                },
                controller: ['$scope', '$interval', '$mdDialog', '$mdToast', 'parent', DialogController],
            })
            .then(function(result) {
                console.log("pomo complete: ", result)

                if (result === "done") {

                    self.todo.PomodoroComplete++;

                    // todoService.pomoComplete(todo)
                    //   .then(
                    //   function success(data) {
                    //       $mdToast.show($mdToast.simple().content('todo created :]'));
                    //       self.showEditable = false;
                    //   },
                    //   function(error) {
                    //       $mdToast.show($mdToast.simple().content("unable to update todo :[\nsee console for details"));
                    //       console.log(error)
                    //   });

                }

            }, function(result) {
                console.log("dialog closed... early??? ", result)

                // todoService.pomoEndedEarly(todo)
                //   .then(
                //   function success(data) {
                //       $mdToast.show($mdToast.simple().content('todo created :]'));
                //       self.showEditable = false;
                //   },
                //   function(error) {
                //       $mdToast.show($mdToast.simple().content("unable to update todo :[\nsee console for details"));
                //       console.log(error)
                //   });

            });

        function DialogController($scope, $interval, $mdDialog, $mdToast, parent) {

            $scope.started = false;
            $scope.running = false;
            $scope.complete = false;
            $scope.clock = "25:00";
            $scope.sound = new Howl({
                  src: [
                    '/assets/audio/gong.ogg',
                    '/assets/audio/gong.mp3', 
                  ],
                  autoplay: false,
                  loop: true,
                  // volume: 0.5,
                  // onend: function() {
                  //   console.log('Finished!');
                  // }
                });
            $scope.$on("$destroy", function() {
                $scope.sound.unload();
            });

            $scope.start = function() {
                console.log("start POMO")

                // signal server starting
                self.todo.PomodoroStarted++

                // start timer 

                var twentyFiveMinutes = 6;
                startTimer(twentyFiveMinutes);
                $scope.started = true;
                $scope.running = true;
            }

            $scope.done = function() {
                console.log("done POMO")
                $interval.cancel($scope.timer);

                // make it go booooooooooooong
                $scope.sound.play();
                
                // send info to server

                $scope.running = false;
                $scope.complete = true;

            };

            $scope.stop = function() {
                console.log("stop POMO")

                var doStop = confirm("Are you sure? Stopping early is recorded too!")
                if (doStop) {
                    $interval.cancel($scope.timer);
                    $scope.running = false;
                }


            }

            $scope.cancel = function() {
                console.log("cancel")
                if ($scope.complete) {
                    $mdDialog.hide('done');
                }
                if (!$scope.started) {
                    $mdDialog.hide('ok');
                }

                if ($scope.started && $scope.running) {
                    var doStop = confirm("Are you sure? Stopping early is recorded too!")
                    if (doStop) {
                        $interval.cancel($scope.timer);
                        $scope.running = false;
                        $mdDialog.cancel('early');
                    }
                }
            };



            function startTimer(duration) {
                var start = Date.now(),
                    diff,
                    minutes,
                    seconds;
                var millis = duration * 1000;

                function timer() {
                    // get the number of seconds that have elapsed since 
                    // startTimer() was called
                    diff = duration - (((Date.now() - start) / 1000) | 0);

                    // does the same job as parseInt truncates the float
                    minutes = (diff / 60) | 0;
                    seconds = (diff % 60) | 0;

                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;

                    $scope.clock = minutes + ":" + seconds;
                    console.log($scope.clock);
                    if (diff == 0) {
                        console.log("LESS THAN ZERO!!")
                        $scope.done();
                    }

                    if (diff <= 0) {
                        // add one second so that the count down starts at the full duration
                        start = Date.now() + 1000;
                    }
                };
                // we don't want to wait a full second before the timer starts
                timer();
                $scope.timer = $interval(timer, 1000, duration);
            }

        }

    }



})
