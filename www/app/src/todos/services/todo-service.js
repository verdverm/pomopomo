angular.module("pomodoroTodoApp")

.factory('todoService', function($http, $q) {

    var _instance = {};

    _instance.todos = [];

    _instance.getAllTodos = function() {
        console.log("loginCreds")
        var defer = $q.defer();

        $http({
                'method': "GET",
                'url': HOMEBASE + "/api/todo",

            })
            .success(function(data, status, headers, config) {
                console.log(data)
                if (data === undefined || data.error !== undefined) {

                    defer.reject(data.error);
                } else {
                    _instance.todos = data;
                    defer.resolve(data);
                }
            })
            .error(function(data, status, headers, config) {

                console.log("getting todos error!!!")

                defer.reject(data.error);
            })

        return defer.promise

    }
    return _instance;
});