angular.module("pomodoroTodoApp")

.controller("RegisterController",
    function($scope, $location, $mdToast, authService) {

        var self = this;
        self.creds = {};
        self.creds = {
            username: "",
            email: "",
            password: "",
            confirm: ""
        };

        // function setAsLoading(bool) {
        //     ngModel.$setValidity('recordLoading', !bool);
        // }

        // function setAsAvailable(bool) {
        //     ngModel.$setValidity('recordAvailable', bool);
        // }

        self.tryRegister = function(evt) {
            // ngMaterial has issues with multiple click events being fired right now
            var pass = clickbuster.onClick(event);
            if (!pass) {
                return;
            }

            // client-side validation
            if (self.creds.username == "" || self.creds.email == "" || self.creds.password == "" || self.creds.confirm == "") {
                $mdToast.show($mdToast.simple().content("form has empty fields"));
                return;
            }

            authService.register(self.creds,
                function success(data) {
                    $location.path("/main");
                },
                function(error) {
                    register.creds.password = "";
                    register.creds.confirm = "";
                    console.log("error: ", error);
                    $mdToast.show($mdToast.simple().content("registering failed :["));
                });

        }

    });
