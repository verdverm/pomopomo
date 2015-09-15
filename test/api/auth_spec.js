var frisby = require('frisby');

var URL = 'http://localhost:8080/auth/';

var TRAVIS = process.env.TRAVIS;
console.log("TRAVIS: ", TRAVIS);

// This test creates a new user
if (TRAVIS == true) {
    console.log("Registering 'test' user");
    frisby.create('POST new user registration')
        .post(URL + 'register', {
            username: "test",
            email: "test@domain.com",
            password: "test",
            confirm: "test"
        }, {
            json: true
        })
        .expectStatus(200)
        .expectJSONTypes({
            uid: String,
            token: String
        })
        .afterJSON(function(result) {
            console.log(result);
        })
        .toss();
}

// this test validates logging in
frisby.create('POST user login')
    .post(URL + 'login', {
        username: "test",
        password: "test"
    }, {
        json: true
    })
    .expectStatus(200)
    .expectJSONTypes({
        uid: String,
        token: String
    })
    .toss();

// this test validates a failed login by username
frisby.create('POST user login fail')
    .post(URL + 'login', {
        username: "test2",
        password: "test"
    }, {
        json: true
    })
    .expectStatus(400)
    .expectJSON({
        Error: "login failure"
    })
    .toss();

// this test validates a failed login by password
frisby.create('POST user login fail')
    .post(URL + 'login', {
        username: "test",
        password: "test2"
    }, {
        json: true
    })
    .expectStatus(400)
    .expectJSON({
        Error: "login failure"
    })
    .toss();



// this test validates username conflict
frisby.create('POST registration fail username')
    .post(URL + 'register', {
        username: "test",
        email: "test@domain.com",
        password: "test",
        confirm: "test"
    }, {
        json: true
    })
    .expectStatus(400)
    .expectJSON({
        Error: "Username taken"
    })
    .toss();


// this test validates email conflict
frisby.create('POST registration fail email')
    .post(URL + 'register', {
        username: "test 2",
        email: "test@domain.com",
        password: "test",
        confirm: "test"
    }, {
        json: true
    })
    .expectStatus(400)
    .expectJSON({
        Error: "Email taken"
    })
    .toss();


// this test validates password mismatch
frisby.create('POST registration password mismatch')
    .post(URL + 'register', {
        username: "test 2",
        email: "test2@domain.com",
        password: "test",
        confirm: "test2"
    }, {
        json: true
    })
    .expectStatus(400)
    .expectJSON({
        Error: "Password mismatch"
    })
    .toss();


// the following tests validate empty fields
frisby.create('POST registration empty username')
    .post(URL + 'register', {
        username: "",
        email: "test2@domain.com",
        password: "test2",
        confirm: "test2"
    }, {
        json: true
    })
    .expectStatus(400)
    .expectJSON({
        Error: "Empty Username"
    })
    .toss();

frisby.create('POST registration empty email')
    .post(URL + 'register', {
        username: "test2",
        email: "",
        password: "test2",
        confirm: "test2"
    }, {
        json: true
    })
    .expectStatus(400)
    .expectJSON({
        Error: "Empty Email"
    })
    .toss();

frisby.create('POST egistration empty password')
    .post(URL + 'register', {
        username: "test2",
        email: "test2@domain.com",
        password: "",
        confirm: "test2"
    }, {
        json: true
    })
    .expectStatus(400)
    .expectJSON({
        Error: "Empty Password"
    })
    .toss();

frisby.create('POST registration empty password confirm')
    .post(URL + 'register', {
        username: "test2",
        email: "test2@domain.com",
        password: "test2",
        confirm: ""
    }, {
        json: true
    })
    .expectStatus(400)
    .expectJSON({
        Error: "Password mismatch"
    })
    .toss();
