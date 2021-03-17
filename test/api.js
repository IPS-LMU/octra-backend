//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require("../build/app.dev.js");
let should = chai.should();


chai.use(chaiHttp);
//Our parent block
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
                    res.should.have.status(200);
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
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
});
