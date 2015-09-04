angular.module("pomodoroTodoApp")

.factory('authService', function($http, $q) {

    var _filename = "Pomodora/token.txt"

    var _instance = {}

    _instance.reset = function() {
        _instance._authed = false;
        _instance._token = null;
        _instance._uid = ""

        delete $http.defaults.headers.common.Authorization;
    }
    _instance.reset();

    _instance.authed = function() {
        return _instance._authed;
    }

    _instance.token = function() {
        return _instance._token;
    }

    _instance.uid = function(id) {
        if (id) {
            _instance._uid = id;
        }
        return _instance._uid;
    }

    _instance.loginCreds = function(username, password) {
        console.log("loginCreds")
        var defer = $q.defer();

        $http({
                'method': "POST",
                'url': HOMEBASE + "/auth/login",

                // also need to send the device information too
                'data': JSON.stringify({
                    'username': username,
                    'password': password
                }),
            })
            .success(function(data, status, headers, config) {
                console.log(data)
                if (data === undefined || data.error !== undefined) {

                    _instance.reset();

                    defer.reject(data.error);
                } else {

                    _instance._uid = data.uid,
                        _instance._token = data.token;
                    _instance._authed = true;
                    $http.defaults.headers.common.Authorization = "Bearer " + data.token;


                    // ERROR check if IndexDB is available
                    saveToken(_instance._token, function(data) {
                        console.log("saveToken ret:", data);
                    });
                    defer.resolve(data);
                }
            })
            .error(function(data, status, headers, config) {
                _instance.reset();

                console.log("login error!!!")

                defer.reject(data.error);
            })

        return defer.promise

    }

    _instance.logout = function() {
        // TODO make http request to remove server side token
        _instance.reset();
        removeToken().then(
            function(data) {
                console.log("logout success")
            },
            function(error) {
                console.log("failed to logout")
            });
    }

    _instance.register = function(details, success_handle, error_handle) {
        $http({
                'method': "POST",
                'url': HOMEBASE + "/auth/register",
                'data': JSON.stringify(details),
            })
            .success(function(data, status, headers, config) {
                // console.log(data)
                if (data === undefined || data.error !== undefined) {
                    error_handle(data.error);
                } else {

                    _instance._uid = data.uid,
                        _instance._token = data.token;
                    _instance._authed = true;
                    $http.defaults.headers.common.Authorization = "Bearer " + data.token;

                    // TODO fix this so that the coken has a shorter life
                    // and the have N (3 days?) to verify their account
                    // via an email

                   saveToken(_instance._token, function(data) {
                       console.log("saveToken ret:", data);
                   });
                    success_handle(data);
                }
            })
            .error(function(data, status, headers, config) {
                error_handle(data.error);
            })
    }

    _instance.loginToken = function() {
        console.log("loginToken START")
        var defer = $q.defer();

        var promise = loadToken();

        promise.then(function(token) {
            _instance._token = token; // set the current token to the one we just read
            $http.defaults.headers.common.Authorization = "Bearer " + token;

            // also need to send the device information too
            return checkTokenWithServer(token); // verify
        }).then(function(data) {
            // console.log("success", data)
            defer.resolve(data);
        }, function(error) {
            defer.reject(error);
        });

        return defer.promise;

    }

    function checkTokenWithServer(token) {
        // console.log("Checking token: ", token)

        var defer = $q.defer();

        $http({
                'method': "GET",
                'url': HOMEBASE + "/api/auth_test",
            })
            .success(function(data, status, headers, config) {
                if (data === undefined || data.error !== undefined) {

                    // destroy token file?
                    _instance._token = null;
                    _instance._authed = false;

                    defer.reject(data.error);
                } else {
                    console.log(data);
                    _instance._uid = data.authed;
                    _instance._authed = true;
                    // _instance._token = token;  // incase we decide to update server side
                    defer.resolve(data);
                }
            })
            .error(function(data, status, headers, config) {
                // destroy token file?
                _instance._token = null;
                _instance._authed = false;

                defer.reject(data.error);
            })

        return defer.promise;
    }

    function loadToken() {
        console.log("loadToken")

        if( window.isMac ) {
            return loadTokenFromFile();
        } else {
            return loadTokenFromDB();
        }
    }

    function saveToken(token) {
        console.log("saveToken", token)

        if( window.isMac ) {
            return saveTokenToFile(token);
        } else {
            return saveTokenToDB(token);
        }
    }

    function removeToken() {
        console.log("removeToken")

        if( window.isMac ) {
            return removeTokenFromFile();
        } else {
            return removeTokenFromDB();
        }
    }












    function getTokenFileEntry(doCreate, success_handle, error_handle) {
        navigator.webkitPersistentStorage.requestQuota( 100 * 1024 * 1024, function(grantedBytes) {
            window.requestFileSystem(PERSISTENT, grantedBytes, onSuccess, function(error) {
                console.log("Error occurred during request to file system pointer. Error code is: ", error);
            });
        }, function(e) {
            console.log('Error', e);
        });

        function onSuccess(fileSystem) {
            var directoryEntry = fileSystem.root;

            directoryEntry.getDirectory("Pomodora", {
                create: false,
                exclusive: false
            }, function() {}, function(error) {
                error_handle(error);
            })

            directoryEntry.getFile("Pomodora/token.txt", {
                create: doCreate,
                exclusive: false
            }, function(fileEntry) {
                success_handle(fileEntry);
            }, function(error) {
                error_handle(error);
            });
        }
    }

    function loadTokenFromFile() {
        
        var defer = $q.defer();

        var f = function() {
            var token = localStorage.getItem("token");
            defer.resolve(token);
        }
        
        try {
            console.log("loading token form localStorage")
            f();
        } catch(e) {
            defer.reject(e);
        }

        // getTokenFileEntry(false, function(fileEntry) {

        //     fileEntry.file(function(file) {
        //         var reader = new FileReader();
        //         reader.onloadend = function(evt) {
        //             var token = evt.target.result;
        //             // console.log("User Token: ", token)
        //             defer.resolve(token);
        //         };
        //         reader.readAsText(file);

        //     }, function(error) {
        //         defer.reject(error);
        //     });
        // }, function(error) {
        //     defer.reject(error);
        // });

        return defer.promise;
    }

    function saveTokenToFile(token) {
        var defer = $q.defer();

        var f = function() {
            localStorage.setItem("token", token);
            defer.resolve("success");
        }

        try {
            console.log("saving token to localStorage")
            f();
        } catch(e) {
            defer.reject(e);
        }


        // getTokenFileEntry(true, function(fileEntry) {

        //     fileEntry.file(function(file) {

        //         fileEntry.createWriter(function(writer) {
        //             writer.write(token);
        //             defer.resolve(token);
        //         }, function(error) {
        //             defer.reject(error);
        //         });

        //     }, function(error) {
        //         defer.reject(error);
        //     });
        // }, function(error) {
        //     defer.reject(error);
        // });
        return defer.promise
    }

    function removeTokenFromFile() {
        var defer = $q.defer();
        
        var f = function() {
            localStorage.removeItem("token");
            defer.resolve("success");
        }

        try {
            console.log("removing token form localStorage")
            f();
        } catch(e) {
            defer.reject(e);
        }


        // getTokenFileEntry(true, function(fileEntry) {

        //     fileEntry.file(function(file) {

        //         fileEntry.remove(function(stuff) {
        //             console.log("Logout succeeded", stuff)
        //             defer.resolve(stuff);
        //         }, function(error) {
        //             defer.reject(error);
        //         });

        //     }, function(error) {
        //         defer.reject(error);
        //     });
        // }, function(error) {
        //     defer.reject(error);
        // });
        return defer.promise
    }


    function loadTokenFromDB() {
        console.log("loadTokenFromDB START")
        var defer = $q.defer()

        var name = "token"
        var lower = "tokem"
        var upper = "tokeo"

        sklad.open(dbName, function(err, conn) {
            if (err) {
                console.log("reject: ", err)
                defer.reject(err);
                return
            }

            conn.get('user', {
                range: IDBKeyRange.bound(lower, upper, true, true),
                limit: 1,
                direction: sklad.DESC
            }, function(err, records) {
                if (err) {
                    console.log("reject: ", err)
                    defer.reject(err);
                    return
                }

                if (records.length > 0 && records[0].key && records[0].key == name) {
                    console.log("db resolve token");
                    defer.resolve(records[0].value)
                } else {
                    console.log("reject: ", "token not found")
                    defer.reject("token not found locally");
                }
            });
        });

        return defer.promise;
    }

    function saveTokenToDB(token) {
        console.log("saveTokenToDB", token)
        var defer = $q.defer()

        var name = "token"
        var data = sklad.keyValue(name, token);

        sklad.open(dbName, function(err, conn) {
            if (err) {
                defer.reject(err);
                return;
            }
            conn.upsert('user', data, function(err, key) {
                if (err) {
                    defer.reject(err);
                    return;
                }
                defer.resolve("success: " + key);
            });
        });

        return defer.promise;
    }

    function removeTokenFromDB() {
        console.log("removeTokenFromDB")
        var defer = $q.defer()

        var name = "token"

        sklad.open(dbName, function(err, conn) {
            if (err) {
                defer.reject(err);
                return;
            }
            conn.delete('user', name, function(err) {
                if (err) {
                    defer.reject(err);
                    return;
                }
                defer.resolve("success");
            });
        });

        return defer.promise;
    }

    return _instance;
});