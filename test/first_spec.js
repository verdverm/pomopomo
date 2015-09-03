var frisby = require('frisby');

var URL = 'http://localhost:8080/api/';
var UUID = 'c46157d-fb83-40d0-9b45-f4c33efd919'

frisby.globalSetup({ // globalSetup is for ALL requests
  request: {
    headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NDM4MTcwOTQsImlkIjoiYzQ2MTU3ZC1mYjgzLTQwZDAtOWI0NS1mNGMzM2VmZDkxOSJ9.tsN_4QZyTmGX0ILiMgihLfbpgJawnkPyAU_GO6fjyY8' }
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

    for (var i = 0; i < todos.length; i++) {
      var todo = todos[i];

      // console.log(todo);

      frisby.create('Delete todo ' + i)
        .delete(URL + 'todo/' + todo.id)
        .expectStatus(200)
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

frisby.create('POST new todo')
  .post(URL + 'todo', {
        name: "test todo",
        description: "this is my first ever pomodoro todo!!"
    }, {json: true})
  .expectStatus(200)
  .expectJSONTypes({
    result: String,
    tid: Number
  })
  .expectJSON({
    result: "success!"  
  })
  .afterJSON(function(result){
    // console.log(result);

    frisby.create('GET existing todo')
      .get(URL + 'todo/' + result.tid)
      .expectStatus(200)
      .expectJSON({
        id: result.tid,
        Uuid: UUID,
        Name: 'test todo'
      })
    .toss();

    frisby.create('Delete todo')
      .delete(URL + 'todo/' + result.tid)
      .expectStatus(200)
    .toss();

  })
.toss();



// frisby.create('GET .status')
//   .get(URL + '.status')
//   .expectStatus(200)
// .toss()

/*
frisby.create('GET user johndoe')
  .get(URL + '/users/3.json')
  .expectStatus(200)
  .expectJSONTypes({
    id: Number,
    username: String,
    is_admin: Boolean
  })
  .expectJSON({
    id: 3,
    username: 'johndoe',
    is_admin: false
  })
  // 'afterJSON' automatically parses response body as JSON and passes it as an argument
  .afterJSON(function(user) {
    // You can use any normal jasmine-style assertions here
    expect(1+1).toEqual(2);

    // Use data from previous result in next test
    frisby.create('Update user')
      .put(URL_AUTH + '/users/' + user.id + '.json', {tags: ['jasmine', 'bdd']})
      .expectStatus(200)
    .toss();
  })
.toss();
*/