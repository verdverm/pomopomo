var frisby = require('frisby');

var URL = 'http://localhost:8080/api/';

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
    authed: 'c46157d-fb83-40d0-9b45-f4c33efd919'
  })
.toss();

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