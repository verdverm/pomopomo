var frisby = require('frisby');

var UUID = process.env.UUID;
var TOKEN = process.env.TOKEN;

var URL = 'http://localhost:8080/api/';

frisby.globalSetup({ // globalSetup is for ALL requests
    request: {
        headers: {
            'Authorization': 'Bearer ' + TOKEN
        }
    }
});

frisby.create('GET auth_test')
    .get(URL + 'auth_test')
    .expectStatus(200)
    .expectJSONTypes({
        authed: String
    })
    .expectJSON({
        authed: UUID
    })
    .toss();


frisby.create('GET all todos')
    .get(URL + 'todo')
    .expectStatus(200)
    // .expectJSON([])
    .afterJSON(function(todos) {
        // Use data from previous result in next test
        // console.log(todos);

        for (var i = 0; i < todos.length; i++) {
            var todo = todos[i];
            // console.log("deleteing: ", i,todo.id)

            frisby.create('Delete todo ' + i)
                .delete(URL + 'todo/' + todo.id)
                .expectStatus(200)
                .afterJSON(function(result) {
                    // console.log("delete result: ", result)
                })
                .toss();

        };
    })
    .toss();


frisby.create('GET non-existant todo')
    .get(URL + 'todo/0')
    .expectStatus(400)
    .expectJSON({
        Error: "todo not found"
    })
    .toss();


frisby.create('GET all todos (empty)')
    .get(URL + 'todo')
    .expectStatus(200)
    .expectJSON([])
    .afterJSON(function(todos) {
        // Use data from previous result in next test
        // console.log(todos);
    })
    .toss();

return

frisby.create('POST new todo')
    .post(URL + 'todo', {
        name: "test todo",
        description: "this is my first ever pomodoro todo!!"
    }, {
        json: true
    })
    .expectStatus(200)
    .expectJSONTypes({
        result: String,
        todo: Object,
    })
    .expectJSON({
        result: "success!"
    })
    .afterJSON(function(result) {
        // console.log(result);

        frisby.create('GET existing todo')
            .get(URL + 'todo/' + result.todo.id)
            .expectStatus(200)
            .expectJSON({
                id: result.todo.id,
                Uuid: UUID,
                Name: 'test todo'
            })
            .toss();

        frisby.create('Delete todo')
            .delete(URL + 'todo/' + result.todo.id)
            .expectStatus(200)
            .toss();

    })
    .toss();
