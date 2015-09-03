var frisby = require('frisby');

var URL = 'http://localhost:8080/api/';
var UUID = 'c46157d-fb83-40d0-9b45-f4c33efd919'

frisby.globalSetup({ // globalSetup is for ALL requests
  request: {
    headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NDM4MTcwOTQsImlkIjoiYzQ2MTU3ZC1mYjgzLTQwZDAtOWI0NS1mNGMzM2VmZDkxOSJ9.tsN_4QZyTmGX0ILiMgihLfbpgJawnkPyAU_GO6fjyY8' }
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
    tid: Number
  })
  .expectJSON({
    result: "success!"  
  })
  .afterJSON(function(result){
    // console.log(result);

    var tid = result.tid;

    frisby.create('GET existing todo')
      .get(URL + 'todo/' + result.tid)
      .expectStatus(200)
      .expectJSON({
        id: tid,
        Uuid: UUID,
        Name: 'test pomos todo'
      })
    .toss();



  })
.toss();