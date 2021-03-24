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
        id: 0,
        name: "TestUser",
        email: "testemail@testtest.de"
    },
    jwtToken: ""
};
const appToken = "a810c2e6e76774fadf03d8edd1fc9d1954cc27d6";
describe('User', () => {

    if (true) {
        describe('/POST v1/user/register', () => {
            it('it should POST a new user registration', (done) => {
                const request = {
                    "name": tempData.user.name,
                    "email": tempData.user.email,
                    "password": "Password12345"
                }

                chai.request(server)
                    .post('/v1/user/register')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        tempData.jwtToken = res.body.token;
                        tempData.user.id = res.body.data.id;

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
                    "password": "Password12345"
                }
                chai.request(server)
                    .post('/v1/user/login')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        res.body.status.should.be.equal("success");
                        res.body.should.be.a('object')
                        tempData.user.id = res.body.data.id;
                        done();
                    });
            });
        });
    }

    if (true) {
        describe('/GET v1/user/', () => {
            it('it should retrieve a list of users', (done) => {
                chai.request(server)
                    .get(`/v1/user`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
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


if (true) {
    describe('App', () => {
        if (true) {
            describe('/POST v1/app/token', () => {
                it('it should save an app token to the database', (done) => {
                    const request = {
                        "name": "Julian",
                        "domain": "localhost",
                        "description": "Neuer Key2"
                    }
                    chai.request(server)
                        .post('/v1/app/token')
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http://localhost:8080")
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
            describe('/GET v1/app/token', () => {
                it('it should retrieve a list of app tokens', (done) => {
                    chai.request(server)
                        .get(`/v1/app/token`)
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http://localhost:8080")
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


if (true) {
    describe('Project', () => {
        if (true) {
            describe('/POST v1/project', () => {
                it('it should create a project', (done) => {
                    const request = {
                        "name": "SuperDuperProjekt!",
                        "admin_id": 22
                    }
                    chai.request(server)
                        .post('/v1/project')
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http://localhost:8080")
                        .set("x-access-token", tempData.jwtToken)
                        .send(request)
                        .end((err, res) => {
                            checkForErrors(err, res);
                            log(`added ${res.body.data.id}`);

                            res.status.should.be.equal(200);
                            res.body.should.be.a('object');
                            done();
                        });
                });
            });
        }
    });
}


if (true) {
    describe('Media', () => {
        if (true) {
            describe('/POST v1/media', () => {
                it('it should add a new mediaitem', (done) => {
                    const request = {
                        "url": "http://localhost/test.wav",
                        "type": "audio/wav",
                        "size": 12345567
                    }
                    chai.request(server)
                        .post('/v1/media')
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http://localhost:8080")
                        .set("x-access-token", tempData.jwtToken)
                        .send(request)
                        .end((err, res) => {
                            checkForErrors(err, res);
                            log(`added ${res.body.data.id}`);

                            res.status.should.be.equal(200);
                            res.body.should.be.a('object');
                            done();
                        });
                });
            });
        }
    });
}


if (true) {
    describe('Tool', () => {
        if (true) {
            describe('/POST v1/tool', () => {
                it('it should add a new tool', (done) => {
                    const request = {
                        "name": "newSuperTool",
                        "version": "1.0.0",
                        "description": "some description"
                    }
                    chai.request(server)
                        .post('/v1/tool')
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http://localhost:8080")
                        .set("x-access-token", tempData.jwtToken)
                        .send(request)
                        .end((err, res) => {
                            checkForErrors(err, res);
                            log(`added ${res.body.data.id}`);

                            res.status.should.be.equal(200);
                            res.body.should.be.a('object');
                            done();
                        });
                });
            });
        }
    });
}

if (true) {
    describe('Transcript', () => {
        if (true) {
            describe('/POST v1/transcript', () => {
                it('it should add a new transcript', (done) => {
                    const request = {
                        pid: "pid",
                        orgtext: "orgtext",
                        assessment: "assassment",
                        priority: 12,
                        status: "status",
                        "code": "code",
                        tool_id: 3,
                        transcriber_id: 22,
                        project_id: 5,
                        mediaitem_id: 8
                    }
                    chai.request(server)
                        .post('/v1/transcript')
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http://localhost:8080")
                        .set("x-access-token", tempData.jwtToken)
                        .send(request)
                        .end((err, res) => {
                            checkForErrors(err, res);
                            log(`added ${res.body.data.id}`);

                            res.status.should.be.equal(200);
                            res.body.should.be.a('object');
                            done();
                        });
                });
            });
        }
    });
}


if (true) {
    describe('Delete Entries', () => {
        if (true) {
            describe('/DELETE v1/app/token', () => {
                it('it should remove an app token', (done) => {
                    chai.request(server)
                        .delete(`/v1/app/token/${tempData.apptoken.addedID}`)
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http://localhost:8080")
                        .set("x-access-token", tempData.jwtToken)
                        .end((err, res) => {
                            checkForErrors(err, res);

                            res.status.should.be.equal(200);
                            res.body.should.be.a('object');
                            done();
                        });
                });
            });
        }

        if (true) {
            describe(`/DELETE v1/user/`, () => {
                it('it should remove a user account', (done) => {
                    chai.request(server)
                        .delete(`/v1/user/${tempData.user.id}`)
                        .set("Authorization", `Bearer ${appToken}`)
                        .set("Origin", "http://localhost:8080")
                        .set("x-access-token", tempData.jwtToken)
                        .end((err, res) => {
                            checkForErrors(err, res);
                            res.status.should.be.equal(200);
                            res.body.data.should.be.a('object');

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

function logJSON(json) {
    const jsonStr = JSON.stringify(json, null, 2);
    const array = jsonStr.split("\n");

    console.log(array.map(a => `\t${a}`).join("\n"));
}


function checkForErrors(err, res) {
    // logJSON(res.body);
    assert.equal(err, undefined, err);
    res.body.status.should.be.equal('success', res.body.message);
    assert.equal(res.error, false, res.error.message);
}
