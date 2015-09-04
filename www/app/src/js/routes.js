angular.module('pomodoroTodoApp')
    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/');

            $stateProvider

            // AUTH related
            .state('index',{
                url: '/',
                templateUrl: 'src/templates/index.html'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'src/auth/view/login.html'
            })
            .state('register', {
                url: '/register',
                templateUrl: 'src/auth/view/register.html'
            })


            // MAIN page
            .state('main', {
                url: '/main',
                templateUrl: 'src/templates/main.html'
            })


       }
    ])
