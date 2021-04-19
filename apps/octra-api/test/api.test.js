//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let {app} = require("../../../dist/apps/octra-api/main.js");
let server = app;
let assert = chai.assert;
chai.should();

chai.use(chaiHttp);

const tempData = {
    apptoken: {
        addedID: 0,
        removedID: 0,
    },
    admin: {
        id: 0,
        jwtToken: ""
    },
    user: {
        id: 0,
        name: "TestUser_" + Date.now(),
        email: "testemail@testtest.de",
        jwtToken: ""
    },
    project: {
        id: 0,
        name: ""
    },
    mediaItem: {
        id: 0
    },
    transcript: {
        id: 0
    },
    tool: {
        id: 0
    }
};

const todoList = {
    user: {
        register: true,
        login: true,
        hash: true,
        assign: true,
        getUserInfo: true,
        getCurrentInfo: true,
        getUsers: true,
        delete: true,
        password: {
            change: true
        }
    },
    app: {
        tokens: {
            add: true,
            change: true,
            refresh: true,
            delete: true,
            getList: true,
        }
    },
    project: {
        create: true,
        transcripts: {
            get: true
        }
    },
    media: {
        add: true
    },
    tool: {
        add: true
    },
    dataDelivery: {
        deliver: true
    },
    transcripts: {
        add: false,
        get: true
    }
};

const appToken = "a810c2e6e76774fadf03d8edd1fc9d1954cc27d6";
describe('User', () => {
    if (todoList.user.register) {
        describe('/POST v1/users/register', () => {
            it('it should POST a new user registration', (done) => {
                const request = {
                    "name": tempData.user.name,
                    "email": tempData.user.email,
                    "password": "Password12345"
                }

                chai.request(server)
                    .post('/v1/users/register')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        tempData.user.jwtToken = res.body.token;
                        tempData.user.id = res.body.data.id;

                        res.body.status.should.be.equal("success");
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }

    if (todoList.user.login) {
        describe('/POST v1/login', () => {
            it('it should POST a user login', (done) => {
                const request = {
                    "name": "Julian",
                    "password": "Test123"
                }
                chai.request(server)
                    .post('/v1/users/login')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        res.body.status.should.be.equal("success");
                        res.body.should.be.a('object')
                        tempData.admin.id = res.body.data.id;
                        tempData.admin.jwtToken = res.body.token;
                        done();
                    });
            });
        });
    }

    if (todoList.user.login) {
        describe('/POST v1/login', () => {
            it('it should POST a user login via Shibboleth', (done) => {
                const request = {
                    "type": "shibboleth"
                }
                chai.request(server)
                    .post('/v1/users/login')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        res.body.status.should.be.equal("success");
                        res.body.should.be.a('object')
                        done();
                    });
            });
        });
    }

    if (todoList.user.hash) {
        describe('/GET v1/users/hash', () => {
            it('it should GET if user exists by hash', (done) => {
                chai.request(server)
                    .get('/v1/users/hash?hash=d541f5d102b749b9f91dfe5e46ed9de85c66cf8ecbaf70155352c2cc38e73e19&loginmethod=shibboleth')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .end((err, res) => {
                        checkForErrors(err, res);
                        log("found?:" + res.body.data);
                        res.body.status.should.be.equal("success");
                        res.body.should.be.a('object')
                        done();
                    });
            });
        });
    }

    if (todoList.user.assign) {
        describe('/POST v1/users/:id/roles', () => {
            it('it should assign user roles', (done) => {
                const request = {
                    roles: ["data_delivery"]
                }
                chai.request(server)
                    .post(`/v1/users/${tempData.user.id}/roles`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("x-access-token", tempData.admin.jwtToken)
                    .set("Origin", "http://localhost:8080")
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        res.body.status.should.be.equal("success");
                        res.body.should.be.a('object')
                        done();
                    });
            });
        });
    }

    if (todoList.user.login) {
        describe('/POST v1/login', () => {
            it('it should POST a normal user login', (done) => {
                const request = {
                    "type": "local",
                    "name": tempData.user.name,
                    "password": "Password12345"
                }
                chai.request(server)
                    .post('/v1/users/login')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        res.body.status.should.be.equal("success");
                        res.body.should.be.a('object')
                        tempData.user.id = res.body.data.id;
                        tempData.user.jwtToken = res.body.token;
                        done();
                    });
            });
        });
    }

    if (todoList.user.getUsers) {
        describe('/GET v1/users/', () => {
            it('it should retrieve a list of users', (done) => {
                chai.request(server)
                    .get(`/v1/users`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
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

    if (todoList.user.getUserInfo) {
        describe('/GET v1/users/:id', () => {
            it('it should retrieve information about a user by id', (done) => {
                chai.request(server)
                    .get(`/v1/users/${tempData.user.id}`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
                    .end((err, res) => {
                        checkForErrors(err, res);

                        res.status.should.be.equal(200);
                        res.body.data.should.be.a('object');
                        done();
                    });
            });
        });
    }


    if (todoList.user.getCurrentInfo) {
        describe('/GET v1/users/current', () => {
            it('it should retrieve information about the current user.', (done) => {
                chai.request(server)
                    .get(`/v1/users/current`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
                    .end((err, res) => {
                        checkForErrors(err, res);

                        res.status.should.be.equal(200);
                        res.body.data.should.be.a('object');
                        done();
                    });
            });
        });
    }

    if (todoList.user.password.change) {
        describe('/PUT v1/users/password', () => {
            it('it should change the password for the user logged in', (done) => {
                const request = {
                    oldPassword: 'Password12345',
                    password: 'test12345'
                }
                chai.request(server)
                    .put(`/v1/users/password`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("x-access-token", tempData.user.jwtToken)
                    .set("Origin", "http://localhost:8080")
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        res.body.status.should.be.equal("success");
                        res.body.should.be.a('object')
                        done();
                    });
            });
        });
    }
});


describe('App', () => {
    if (todoList.app.tokens.add) {
        describe('/POST v1/app/tokens', () => {
            it('it should save an app token to the database', (done) => {
                const request = {
                    "name": "Julian",
                    "domain": "localhost",
                    "description": "Neuer Key2"
                }
                chai.request(server)
                    .post('/v1/app/tokens')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
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

    if (todoList.app.tokens.change) {
        describe('/POST v1/app/tokens', () => {
            it('it should change an app token', (done) => {
                const request = {
                    "name": "Test Token",
                    "domain": "localhost",
                    "description": "Changed Key3"
                }
                chai.request(server)
                    .put(`/v1/app/tokens/${tempData.apptoken.addedID}`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        log(`changed app token ${tempData.apptoken.addedID}`);

                        res.status.should.be.equal(200);
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }

    if (todoList.app.tokens.refresh) {
        describe('/POST v1/app/tokens', () => {
            it('it should refresh an app token', (done) => {
                const request = {}
                chai.request(server)
                    .put(`/v1/app/tokens/${tempData.apptoken.addedID}/refresh`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        log(`refreshed app token ${tempData.apptoken.addedID}`);

                        res.status.should.be.equal(200);
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }

    if (todoList.app.tokens.getList) {
        describe('/GET v1/app/tokens', () => {
            it('it should retrieve a list of app tokens', (done) => {
                chai.request(server)
                    .get(`/v1/app/tokens`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
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


describe('Project', () => {
    if (todoList.project.create) {
        describe('/POST v1/projects', () => {
            tempData.project.name = "TestProject_" + Date.now();
            it('it should create a project', (done) => {
                const request = {
                    "name": tempData.project.name,
                    "admin_id": tempData.admin.id
                }
                chai.request(server)
                    .post('/v1/projects')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        tempData.project.id = res.body.data.id;

                        res.status.should.be.equal(200);
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }
});
describe('Media', () => {
    if (todoList.media.add) {
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
                    .set("x-access-token", tempData.admin.jwtToken)
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        log(`added ${res.body.data.id}`);
                        tempData.mediaItem.id = res.body.data.id;
                        res.status.should.be.equal(200);
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }
});


describe('Tool', () => {
    if (todoList.tool.add) {
        describe('/POST v1/tools', () => {
            it('it should add a new tool', (done) => {
                const request = {
                    "name": "newSuperTool",
                    "version": "1.0.0",
                    "description": "some description"
                }
                chai.request(server)
                    .post('/v1/tools')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        log(`added ${res.body.data.id}`);
                        tempData.tool.id = res.body.data.id;
                        res.status.should.be.equal(200);
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }
});

describe('Data Delivery', () => {
    if (todoList.dataDelivery.deliver) {
        describe('/POST v1/delivery/media/', () => {
            it('it should deliver a new audio file', (done) => {
                console.log(`PROJECT ID FOR TEST ${tempData.project.id}`);
                const request = {
                    project_id: tempData.project.id,
                    media: {
                        url: `http://localhost/${Date.now()}.wav`,
                        type: "audio/wav",
                        size: 2334,
                        metadata: ""
                    }
                }
                chai.request(server)
                    .post('/v1/delivery/media')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.user.jwtToken)
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        res.status.should.be.equal(200);
                        log(`delivered new media! Transcript ID: ${res.body.data.transcriptID}`);
                        tempData.transcript.id = res.body.data.transcriptID;
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }
});

describe('Transcripts', () => {
    if (todoList.transcripts.add) {
        describe('/POST v1/transcripts', () => {
            it('it should add a new transcript', (done) => {
                const request = {
                    project_id: tempData.project.id,
                    mediaitem_id: tempData.mediaItem.id
                }
                chai.request(server)
                    .post('/v1/transcripts')
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
                    .send(request)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        log(`added ${res.body.data.id}`);
                        tempData.transcript.id = res.body.data.id;
                        res.status.should.be.equal(200);
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }

    if (todoList.transcripts.get) {
        describe('/GET v1/transcripts/:id', () => {
            it('it should get an transcript by id', (done) => {
                chai.request(server)
                    .get(`/v1/transcripts/481`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.user.jwtToken)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        log(`retrieved rows: ${res.body.data.length}`);

                        res.status.should.be.equal(200);
                        res.body.data.should.be.a('object');
                        done();
                    });
            });
        });
    }

    if (todoList.project.transcripts.get) {
        describe('/GET v1/projects/:id/transcripts', () => {
            it('it should list an array of transcripts for a given project', (done) => {
                chai.request(server)
                    .get(`/v1/projects/${tempData.project.id}/transcripts`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.user.jwtToken)
                    .end((err, res) => {
                        checkForErrors(err, res);
                        log(`list of ${res.body.data.length} transcripts for project ${tempData.project.name}`);

                        res.status.should.be.equal(200);
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }
});


describe('Delete Entries', () => {
    if (todoList.app.tokens.delete) {
        describe('/DELETE v1/app/tokens', () => {
            it('it should remove an app token', (done) => {
                chai.request(server)
                    .delete(`/v1/app/tokens/${tempData.apptoken.addedID}`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
                    .end((err, res) => {
                        checkForErrors(err, res);

                        res.status.should.be.equal(200);
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });
    }

    if (todoList.user.delete) {
        describe(`/DELETE v1/users/`, () => {
            it('it should remove a user account', (done) => {
                chai.request(server)
                    .delete(`/v1/users/${tempData.user.id}`)
                    .set("Authorization", `Bearer ${appToken}`)
                    .set("Origin", "http://localhost:8080")
                    .set("x-access-token", tempData.admin.jwtToken)
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

function log(str) {
    console.log(`\t[CHAI]: ${str}`);
}

function logJSON(json) {
    const jsonStr = JSON.stringify(json, null, 2);
    const array = jsonStr.split("\n");

    console.log(array.map(a => `\t${a}`).join("\n"));
}


function checkForErrors(err, res) {
    //logJSON(res.body);
    //console.log(res.headers);
    assert.equal(err, undefined, err);
    res.body.status.should.be.equal('success', JSON.stringify(res.body.message, null, 2));
    assert.equal(res.error, false, res.error.message);
}
