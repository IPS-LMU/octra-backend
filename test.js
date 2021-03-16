const request = require('request');
const fs = require("fs");

// test register
request.post("http://localhost:8080/v1/user/register", {
    form: {
        "name": "Julian",
        "email": "somemail@email.de",
        "password": "Password1234"
    },
    headers: {
        'Authorization': '73426T79ER58VASAD435$1542352AWEQTNBRE'
    }
}, (err, httpResponse, body) => {
    console.log("TEST register");
    console.log(JSON.stringify(JSON.parse(body), null, 2));
    console.log("---")
});

// test login
request.post("http://localhost:8080/v1/login", {
    form: {
        "name": "Julian",
        "email": "somemail@email.de",
        "password": "Password1234"
    },
    headers: {
        'Authorization': '73426T79ER58VASAD435$1542352AWEQTNBRE'
    }
}, (err, httpResponse, body) => {
    console.log("TEST login");
    console.log(JSON.stringify(JSON.parse(body), null, 2));
    console.log("---")
});
