//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require("../build/app.dev.js");
chai.should();


chai.use(chaiHttp);
describe('User', () => {

    describe('/POST v1/user/register', () => {
        it('it should POST a new user registration', (done) => {
            const request = {
                "name": "Julian",
                "email": "somemail@email.de",
                "password": "Password1234"
            }

            chai.request(server)
                .post('/v1/user/register')
                .send(request)
                .auth('73426T79ER58VASAD435$1542352AWEQTNBRE', {type: "bearer"})
                .end((err, res) => {
                    if (res.body.status === "error") {
                        console.log(`Error: ${res.body.message}`);
                    }
                    res.body.status.should.be.equal("success");
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('/POST v1/login', () => {
        it('it should POST a user login', (done) => {
            const request = {
                "name": "Julian",
                "email": "somemail@email.de",
                "password": "Password1234"
            }
            chai.request(server)
                .post('/v1/user/login')
                .send(request)
                .auth('73426T79ER58VASAD435$1542352AWEQTNBRE', {type: "bearer"})
                .end((err, res) => {
                    if (res.body.status === "error") {
                        console.log(`Error: ${res.body.message}`);
                    }
                    res.body.status.should.be.equal("success");
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('/POST v1/app/token', () => {
        it('it should POST an app token', (done) => {
            const request = {
                "name": "Julian",
                "key": "oaspdkasdpokaspdkdasd",
                "domain": "https://localhost.de",
                "description": "aosdkaopsdk opkasd paos",
                "token": "73426T79ER58VASAD435$1542352AWEQTNBRE"
            }
            chai.request(server)
                .post('/v1/app/token')
                .send(request)
                .auth('73426T79ER58VASAD435$1542352AWEQTNBRE', {type: "bearer"})
                .end((err, res) => {
                    if (res.body.status === "error") {
                        console.log(`Error: ${res.body.message}`);
                    }
                    res.status.should.be.equal(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
});


describe('App', () => {
    describe('/POST v1/app/token', () => {
        it('it should save an app token to the database', (done) => {
            const request = {
                "name": "Julian",
                "domain": "https://localhost.de",
                "description": "aosdkaopsdk opkasd paos",
                "token": "73426T79ER58VASAD435$1542352AWEQTNBRE"
            }
            chai.request(server)
                .post('/v1/app/token')
                .send(request)
                .auth('73426T79ER58VASAD435$1542352AWEQTNBRE', {type: "bearer"})
                .end((err, res) => {
                    if (res.body.status === "error") {
                        console.log(`Error: ${res.body.message}`);
                    }
                    res.status.should.be.equal(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
});
