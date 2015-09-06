var frisby = require('frisby');
var auth = require("./auth_data");

var URL = 'http://localhost:8080/api/';

frisby.globalSetup({ // globalSetup is for ALL requests
  request: {
    headers: { 'Authorization': 'Bearer ' + auth.TOKEN }
  }
});


frisby.create('POST new todo')
  .post(URL + 'todo', {
        name: "test pomos todo",
        description: "this is todo to test pomos!!"
    }, {json: true})
  .expectStatus(200)
  .expectJSONTypes({
    result: String,
    todo: Object
  })
  .expectJSON({
    result: "success!"  
  })
  .afterJSON(function(ret){
    // console.log(ret);

    var tid = ret.todo.id;

    frisby.create('GET existing todo')
      .get(URL + 'todo/' + tid)
      .expectStatus(200)
      .expectJSON({
        id: tid,
        Uuid: auth.UUID,
        Name: 'test pomos todo'
      })
    .toss();

    frisby.create('GET pomo start')
      .post(URL + 'todo/' + tid + "/pomo_start")
      .expectStatus(200)
      .expectJSON({
        result: 'pomo started',
        tid: tid
      })
    .toss();

    frisby.create('GET existing todo')
      .get(URL + 'todo/' + tid)
      .expectStatus(200)
      .expectJSON({
        id: tid,
        Uuid: auth.UUID,
        PomodoroStarted: 1
      })
    .toss();

    frisby.create('GET pomo stop')
      .put(URL + 'todo/' + tid + "/pomo_stop")
      .expectStatus(200)
      .expectJSON({
        result: 'early',
        tid: tid
      })
    .toss();

    frisby.create('GET existing todo')
      .get(URL + 'todo/' + tid)
      .expectStatus(200)
      .expectJSON({
        id: tid,
        Uuid: auth.UUID,
        PomodoroStarted: 1,
        PomodoroCompleted: 0,
        PomodoroCount: 0
      })
    .toss();

    frisby.create('Delete todo')
      .delete(URL + 'todo/' + tid)
      .expectStatus(200)
    .toss();

  })
.toss();