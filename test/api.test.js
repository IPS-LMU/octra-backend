//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require("../build/app.dev.js");
let assert = chai.assert;
chai.should();


chai.use(chaiHttp);

const tempData = {
    apptoken: {
        addedID: 0,
        removedID: 0,
    },
    user: {
        name: "Julian_" + Date.now()
    },
    jwtToken: ""
};
const appToken = "c817cda2c5f7635e8f5dd49c3d7958ad32bfdbd2";
describe('User', () => {

    if (true) {
        describe('/POST v1/user/register', () => {
            it('it should POST a new user registration', (done) => {
                const request = {
                    "name": tempData.user.name,
                    "password": "Password1234"
                }

                chai.request(server)
                    .post('/v1/user/register')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http:localhost:8080")
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        tempData.jwtToken = res.body.token;

                        res.body.status.should.be.equal("success");
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }

    if (true) {
        describe('/POST v1/login', () => {
            it('it should POST a user login', (done) => {
                const request = {
                    "name": tempData.user.name,
                    "password": "Password1234"
                }
                chai.request(server)
                    .post('/v1/user/login')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http:localhost:8080")
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        res.body.status.should.be.equal("success");
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }
});


if (true) {
    describe('App', () => {
        if (true) {
            describe('/POST v1/app/token', () => {
                it('it should save an app token to the database', (done) => {
                    const request = {
                        "name": "Julian",
                        "domain": "http://localhost",
                        "description": "Neuer Key2"
                    }
                    chai.request(server)
                        .post('/v1/app/token')
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http:localhost:8080")
                        .set("x-access-token", tempData.jwtToken)
                        .send(request)
                        .end((err, res) => {
                            checkForErrors(err, res);
                            tempData.apptoken.addedID = res.body.data.id;
                            log(`added ${res.body.data.id}`);

                            res.status.should.be.equal(200);
                            res.body.should.be.a('object');
                            done();
                        });
                });
            });
        }

        if (true) {
            describe('/DELETE v1/app/token', () => {
                it('it should remove an app token', (done) => {
                    chai.request(server)
                        .delete(`/v1/app/token/${tempData.apptoken.addedID}`)
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http:localhost:8080")
                        .set("x-access-token", tempData.jwtToken)
                        .end((err, res) => {
                            checkForErrors(err, res);
                            log(`removedRows: ${res.body.data.removedRows}`);

                            res.status.should.be.equal(200);
                            res.body.should.be.a('object');
                            done();
                        });
                });
            });
        }

        if (true) {
            describe('/GET v1/app/token', () => {
                it('it should retrieve a list of app tokens', (done) => {
                    chai.request(server)
                        .get(`/v1/app/token`)
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http:localhost:8080")
                        .set("x-access-token", tempData.jwtToken)
                        .end((err, res) => {
                            checkForErrors(err, res);
                            log(`retrieved rows: ${res.body.data.length}`);

                            res.status.should.be.equal(200);
                            res.body.data.should.be.a('array');
                            done();
                        });
                });
            });
        }
    });
}

function log(str) {
    console.log(`\t[CHAI]: ${str}`);
}


function checkForErrors(err, res) {
    assert.equal(err, undefined, err);
    res.body.status.should.be.equal('success', res.body.message);
    assert.equal(res.error, false, res.error.message);
}
