var frisby = require('frisby');
var auth = require("./auth_data");

var URL = 'http://localhost:8080/api/';

frisby.globalSetup({ // globalSetup is for ALL requests
  request: {
    headers: { 'Authorization': 'Bearer ' + auth.TOKEN }
  }
});


// create a bunch of todos

var NUM_TODOS = 50;
for (var i = 0; i < NUM_TODOS; i++) {
		
	var rando = Math.random().toString(36).substring(7);
	var todo_name = "todo " + rando;

	frisby.create('POST new todo')
	  .post(URL + 'todo', {
	        name: todo_name,
	        description: "descript: " + rando
	    }, {json: true})
	  .expectStatus(200)
	  .expectJSONTypes({
	    result: String,
	    todo: Object,
	  })
	  .expectJSON({
	    result: "success!"  
	  })
	.toss();

};


// test paging here




// cleanup

frisby.create('GET all todos')
  .get(URL + 'todo')
  .expectStatus(200)
  // .expectJSON([])
  .afterJSON(function(todos) {
    // Use data from previous result in next test

    expect(todos.length).toEqual(NUM_TODOS);

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