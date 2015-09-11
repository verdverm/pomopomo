angular.module("pomodoroTodoApp")

.controller("LoginController",
    function($rootScope, $scope, $state, $mdToast, authService) {

        // var decls
        var self = this;
        self.creds = {
            username: "",
            password: ""
        };

        self.tryLogin = tryLogin;

        // functions
        function tryLogin(event) {
            // ngMaterial has issues with multiple click events being fired right now
            var pass = clickbuster.onClick(event);
            if (!pass) {
                return;
            }

            console.log(self.creds)

            // client-side validation
            var invalid = false;
            if (self.creds.username == "" ) {
                invalid = true;
            }
            if (self.creds.password == "") {
                invalid = true;
            }

            if (invalid) {
                return
            }

            authService.loginCreds(self.creds.username, self.creds.password)
            .then(
                function success(data) {
                    console.log("Login success", profile)
                    var profile = data.profile;
                    // compare here?
                    // profileService.set(profile);
                    // profileService.save();

                    $rootScope.profile = profile; 

                    $state.go("main");
                },
                function(error) {
                    console.log("error logging in: ", error)
                    self.creds.password = ""
                    $mdToast.show($mdToast.simple().content("login failed :["));
                });

        }
    }
);