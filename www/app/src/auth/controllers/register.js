angular.module("pomodoroTodoApp")

.controller("RegisterController",
    // function($scope, $location, authService, profileService) {
    function($scope, $location, authService) {

        var self = this;
        self.creds = {};

        self.tryRegister = function(evt) {
            // ngMaterial has issues with multiple click events being fired right now
            // if (!clickLock()) {
            //     return;
            // };
            evt.preventDefault();
            console.log("tryRegister - doing", evt)


            authService.register(self.creds,
                function success(data) {
                    var profile = data.profile;
                    // compare here?
                    // profileService.set(profile);
                    // profileService.save();

                    $location.path("/main");

                },
                function(error) {
                    register.creds.password = "";
                    register.creds.confirm = "";
                    console.log("error: ", error);

                });

        }

    });