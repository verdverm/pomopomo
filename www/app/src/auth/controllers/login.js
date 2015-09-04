angular.module("pomodoroTodoApp")

.controller("LoginController",
    function($rootScope, $scope, $state, authService) {

        // var decls
        var self = this;
        self.creds = {};

        self.tryLogin = tryLogin;

        // functions
        function tryLogin(evt) {
            // ngMaterial has issues with multiple click events being fired right now
            // evt.preventDefault();
            console.log("tryLogin - doing", evt)

            // client-side validation
            // ...?

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
                });

        }
    }
);