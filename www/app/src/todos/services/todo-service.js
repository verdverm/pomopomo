angular.module("pomodoroTodoApp")

.factory('todoService', function($http, $q) {

    var _instance = {};

    _instance.todos = [];

    _instance.getAllTodos = getAllTodos;
    _instance.saveNewTodo = saveNewTodo;
    _instance.updateTodo = updateTodo;
    _instance.deleteTodo = deleteTodo;
    _instance.startPomo = startPomo;
    _instance.stopPomo = stopPomo;


    function getAllTodos() {
        console.log("getting all todos")
        var defer = $q.defer();

        $http({
                'method': "GET",
                'url': HOMEBASE + "/api/todo",

            })
            .success(function(data, status, headers, config) {
                // console.log(data)
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

    function saveNewTodo(todo) {
        console.log("saving todo: ", todo);
        var defer = $q.defer();

        $http({
                'method': "POST",
                'url': HOMEBASE + "/api/todo",
                'data': JSON.stringify(todo),
            })
            .success(function(data, status, headers, config) {
                console.log(data)
                if (data === undefined || data.error !== undefined) {
                    // hmmm
                    defer.reject(data.error);
                } else {
                    
                    _instance.todos.push(data.todo);


                    defer.resolve(data);
                }
            })
            .error(function(data, status, headers, config) {

                console.log("saving todo error!!!")

                defer.reject(data);
            })

        return defer.promise
    }

    function updateTodo(todo) {
        console.log("saving todo: ", todo);
        var defer = $q.defer();

        $http({
                'method': "PUT",
                'url': HOMEBASE + "/api/todo/" + todo.id,
                'data': JSON.stringify(todo),
            })
            .success(function(data, status, headers, config) {
                console.log(data)
                if (data === undefined || data.error !== undefined) {

                    defer.reject(data.error);
                } else {
                    
                    // _instance.todos.push(data.todo);


                    defer.resolve(data);
                }
            })
            .error(function(data, status, headers, config) {

                console.log("getting todos error!!!")

                defer.reject(data);
            })

        return defer.promise
    }

    function deleteTodo(todo) {
        console.log("deleteing todo: ", todo);
        var defer = $q.defer();

        $http({
                'method': "DELETE",
                'url': HOMEBASE + "/api/todo/" + todo.id,
            })
            .success(function(data, status, headers, config) {
                console.log(data)
                if (data === undefined || data.error !== undefined) {

                    defer.reject(data.error);
                } else {
                    
                    var pos = _instance.todos.indexOf(todo);
                    console.log("deleting at pos: ", pos);
                    _instance.todos.splice(pos,1);


                    defer.resolve(data);
                }
            })
            .error(function(data, status, headers, config) {

                console.log("deleting todo error!!!")

                defer.reject(data);
            })

        return defer.promise
    }


    function startPomo(todo) {
        console.log("starting pomodoros for todo: ", todo);
        var defer = $q.defer();

        $http({
                'method': "POST",
                'url': HOMEBASE + "/api/todo/" + todo.id + "/pomo_start",
            })
            .success(function(data, status, headers, config) {
                console.log(data)
                if (data === undefined || data.error !== undefined) {
                    defer.reject(data.error);
                } else {
                    
                    // _instance.todos.push(data.todo);
                    defer.resolve(data);
                }
            })
            .error(function(data, status, headers, config) {

                console.log("starting pomos error!!!")

                defer.reject(data);
            })

        return defer.promise
    }

   function stopPomo(todo) {
        console.log("stopping pomodoros for todo: ", todo);
        var defer = $q.defer();

        $http({
                'method': "PUT",
                'url': HOMEBASE + "/api/todo/" + todo.id + "/pomo_stop",
            })
            .success(function(data, status, headers, config) {
                console.log(data)
                if (data === undefined || data.error !== undefined) {
                    defer.reject(data.error);
                } else {
                    defer.resolve(data);
                }
            })
            .error(function(data, status, headers, config) {
                console.log("stopping pomos error!!!")
                defer.reject(data);
            })

        return defer.promise
    }



    return _instance;
});