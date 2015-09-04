// API url
var HOMEBASE = "http://localhost:8080"


    angular
        .module('pomodoroTodoApp', ['ui.router', 'ngMaterial', 'ngMdIcons', 'ngTouch'])
        

        .config(function($mdThemingProvider, $mdIconProvider, $httpProvider) {
            $httpProvider.defaults.useXDomain = true;
            $httpProvider.defaults.withCredentials = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];

            $mdIconProvider
                .defaultIconSet("./assets/svg/avatars.svg", 128)
                .icon("menu", "./assets/svg/menu.svg", 24)
                .icon("share", "./assets/svg/share.svg", 24)
                .icon("google_plus", "./assets/svg/google_plus.svg", 512)
                .icon("hangouts", "./assets/svg/hangouts.svg", 512)
                .icon("twitter", "./assets/svg/twitter.svg", 512)
                .icon("phone", "./assets/svg/phone.svg", 512);

            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .accentPalette('amber');

        })
        

        .run(function($rootScope, $state, $q, authService) {

            window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

            window.isMac = false;
            if ( window.navigator.platform === "MacIntel" || window.navigator.platform === "iPhone") {
                window.isMac = true;
            }

            if (!window.isMac) {
                // console.log("Deleting DB")
                // deleteDB();
                console.log("Migrating DB")
                migrateDB();                
            }

            // login with token if existant
            authService.loginToken()
                .then(function(data) {
                    console.log("GOT HEREEE  Logged in: ", authService.uid())

                    $rootScope.$on('$stateChangeStart',
                        function(event, toState, toParams, fromState, fromParams) {

                            var authed = authService.authed();
                            if (authed && (toState.name === "login" || toState.name === "register")) {
                                console.log("authed, going to main - ")
                                event.preventDefault();
                                $state.transitionTo("main")
                                return;
                            }

                            if (!authed && !(toState.name === "index" || toState.name === "login" || toState.name === "register")) {
                                console.log("authed, going to index - ")
                                event.preventDefault();
                                $state.transitionTo("index")
                                return;
                            }
                        });

                    return authService.uid();
                })

        });