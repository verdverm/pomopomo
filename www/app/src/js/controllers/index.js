angular.module('SpotJams')

.controller("IndexController",
    function($rootScope, $scope, $location, authService, profileService) {
        var self = this;

        // console.log("IndexController")

        // document.addEventListener("deviceready", doInit, false);
        // angular.element(document).ready(function () {
        //     doInit();
        // });

        self.gotoLogin = function(evt) {
            // ngMaterial has issues with multiple click events being fired right now
            // console.log("gotoLogin - enter", evt)
            evt.preventDefault();
            console.log("gotoLogin - doing", evt)
            $location.path("/login");
        }

        function doInit() {
            // create root SpotJams folder (should check)
            console.log("GOT HERE 1")
            // createRootFolder();
 

            // login with token if existant
            authService.loginToken(function(data) {

                console.log("Logged in with: ", data)

                profileService.uid(authService.uid());

                // load profile if existant (it should!)
                profileService.download(function() {
                    profileService.save();

                    var plc = angular.element($('#playlist-container'))
                    plc.scope().tracks = profileService.get().tracks;
                    console.log("init playlist", plc.scope().tracks);

                });

                // load playlist
                // var plc = angular.element($('#playlist-container'))
                // plc.tracks = playlistService.getTracks();


                $location.path("/main");
            }, function(error) {
                console.log("loginToken error: ", error);
            });
        }

        function createRootFolder() {
            requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                function(fileSystem) {
                    var directoryEntry = fileSystem.root;

                    directoryEntry.getDirectory("SpotJams", {
                        create: true,
                        exclusive: false
                    }, function() {
                        console.log("SpotJams folder created");
                    }, function() {
                        console.log("Couldn't create SpotJams folder")
                    });

                    directoryEntry.getDirectory("SpotJams/images", {
                        create: true,
                        exclusive: false
                    }, function() {}, function(error) {
                        error_handle(error);
                    })

                    directoryEntry.getDirectory("SpotJams/tracks", {
                        create: true,
                        exclusive: false
                    }, function() {}, function(error) {
                        error_handle(error);
                    })

                },
                function(error) {
                    console.log("Error occurred during request to file system pointer. Error code is: " + error.code);
                });
        }
    }
);