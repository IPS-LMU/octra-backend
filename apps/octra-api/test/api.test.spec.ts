//Require the dev-dependencies
import {OctraApi} from '../src/app/octra-api';

import * as supertest from 'supertest';
import {ProjectTranscriptsChangeStatusRequestItem, TranscriptStatus} from '@octra/db';
import path = require('path');

const relPath = path.join(__dirname, '..', 'src', 'config.json');
const app = new OctraApi().init('production', relPath);
const request = supertest(app);
// jest.setTimeout(30000)

const tempData = {
  apptoken: {
    addedID: 0,
    removedID: 0
  },
  admin: {
    id: 0,
    jwtToken: ''
  },
  user: {
    id: 0,
    name: 'TestUser_' + Date.now(),
    email: 'testemail@testtest.de',
    jwtToken: ''
  },
  project: {
    id: 0,
    name: ''
  },
  mediaItem: {
    id: 0,
    uploadURL: '',
    url: '',
    delivery_url: ''
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
    loginNormal: true,
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
      getList: true
    }
  },
  project: {
    create: true,
    get: true,
    list: true,
    change: true,
    remove: true,
    transcripts: {
      getAll: true,
      get: true,
      upload: true,
      changeStatus: true
    },
    roles: {
      assign: true
    }
  },
  tool: {
    add: true
  },
  annotation: {
    start: true,
    continue: true,
    save: true
  },
  guidelines: {
    save: true,
    get: true
  },
  files: {
    get: true
  }
};

function logError(message) {
  console.log(`\x1b[31m${message}\x1b[0m`);
}

const appToken = 'a810c2e6e76774fadf03d8edd1fc9d1954cc27d6';

if (todoList.user.register) {
  it('it should POST a new user registration', (done) => {
    const requestData = {
      'name': tempData.user.name,
      'email': tempData.user.email,
      'password': 'Password12345'
    }

    request.post('/v1/users/register')
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .send(requestData)
      .end((err, {body}) => {
        checkForErrors(err, body);
        tempData.user.jwtToken = body.token;
        console.log(body.token);
        tempData.user.id = body.data.id;
        expect(body.status).toBe('success');
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.user.login) {
  it('it should POST a user login', (done) => {
    const requestData = {
      'name': 'Julian',
      'password': 'Test123'
    }
    request
      .post('/v1/users/login')
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .send(requestData)
      .end((err, {body}) => {
        checkForErrors(err, body);
        expect(body.status).toBe('success');
        expect(typeof body.data).toBe('object');
        tempData.admin.id = body.data.id;
        tempData.admin.jwtToken = body.token;
        done();
      });
  });
}

if (todoList.user.assign) {
  it('it should assign user roles', (done) => {
    const requestData = {
      roles: [{
        role: 'data_delivery',
        project_id: 977
      }]
    }
    request
      .post(`/v1/users/${tempData.user.id}/roles`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('X-App-Token', appToken)
      .set('Origin', 'http://localhost:8080')
      .send(requestData)
      .end((err, {body}) => {
        checkForErrors(err, body);
        expect(body.status).toBe('success');
        done();
      });
  });
}

if (todoList.user.loginNormal) {
  it('it should POST a normal user login', (done) => {
    const requestData = {
      'type': 'local',
      'name': tempData.user.name,
      'password': 'Password12345'
    }
    request
      .post('/v1/users/login')
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('X-App-Token', appToken)
      .set('Origin', 'http://localhost:8080')
      .send(requestData)
      .end((err, {body}) => {
        checkForErrors(err, body);
        expect(body.status).toBe('success');
        expect(typeof body.data).toBe('object');
        tempData.user.id = body.data.id;
        tempData.user.jwtToken = body.token;
        done();
      });
  });
}

if (todoList.user.getUsers) {
  it('it should retrieve a list of users', (done) => {
    request
      .get(`/v1/users`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        log(`retrieved rows: ${body.data.length}`);
        expect(Array.isArray(body.data)).toBe(true);
        done();
      });
  });
}

if (todoList.user.getUserInfo) {
  it('it should retrieve information about a user by id', (done) => {
    request
      .get(`/v1/users/${tempData.user.id}`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}


if (todoList.user.getCurrentInfo) {
  it('it should retrieve information about the current user.', (done) => {
    request
      .get(`/v1/users/current`)
      .set('Authorization', `Bearer ${tempData.user.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);

        expect(status).toBe(200);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.user.password.change) {
  it('it should change the password for the user logged in', (done) => {
    const requestData = {
      oldPassword: 'Password12345',
      password: 'test12345'
    }
    request
      .put(`/v1/users/password`)
      .set('Authorization', `Bearer ${tempData.user.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body}) => {
        checkForErrors(err, body);
        expect(body.status).toBe('success');
        done();
      });
  });
}


if (todoList.app.tokens.add) {
  it('it should save an app token to the database', (done) => {
    const requestData = {
      'name': 'Julian',
      'domain': 'localhost',
      'description': 'Neuer Key2'
    }
    request
      .post('/v1/app/tokens')
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        tempData.apptoken.addedID = body.data.id;

        expect(status).toBe(200);
        log(`added ${body.data.id}`);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.app.tokens.change) {
  it('it should change an app token', (done) => {
    const requestData = {
      'name': 'Test Token',
      'domain': 'localhost',
      'description': 'Changed Key3'
    }
    request
      .put(`/v1/app/tokens/${tempData.apptoken.addedID}`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);

        expect(status).toBe(200);
        log(`changed app token ${tempData.apptoken.addedID}`);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.app.tokens.refresh) {
  it('it should refresh an app token', (done) => {
    const requestData = {}
    request
      .put(`/v1/app/tokens/${tempData.apptoken.addedID}/refresh`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);

        expect(status).toBe(200);
        log(`refreshed app token ${tempData.apptoken.addedID}`);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.app.tokens.getList) {
  it('it should retrieve a list of app tokens', (done) => {
    request
      .get(`/v1/app/tokens`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);

        expect(status).toBe(200);
        log(`retrieved rows: ${body.data.length}`);
        expect(Array.isArray(body.data)).toBe(true);
        done();
      });
  });
}


if (todoList.project.create) {
  tempData.project.name = 'TestProject_' + Date.now();
  it('it should create a project', (done) => {
    const requestData = {
      'name': tempData.project.name,
      'description': 'arrsseiosdjp askdopasdk oakdsspoakdopaküpd akdspkapsdükapüds'
    }
    request
      .post('/v1/projects')
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        tempData.project.id = body.data.id;
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.project.roles.assign) {
  it('it should assign user roles for a given project', (done) => {
    const requestData = [{
      userID: 798,
      role: 'project_admin'
    }];

    request
      .post(`/v1/projects/${tempData.project.id}/roles/`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        done();
      });
  });
}

if (todoList.project.roles.assign) {
  it('it should change the user role of a specific user for a given project', (done) => {
    const requestData = [{
      userID: 798,
      role: 'transcriber'
    }];

    request
      .post(`/v1/projects/${tempData.project.id}/roles/`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        done();
      });
  });
}

if (todoList.project.get) {
  it('it should get a project by id', (done) => {
    request
      .get(`/v1/projects/${tempData.project.id}`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('X-App-Token', appToken)
      .set('Origin', 'http://localhost:8080')
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        console.log(`get project id`);
        console.log(`${tempData.project.id}`);
        console.log((body.data as any));
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.project.list) {
  it('it should list projects', (done) => {
    request
      .get('/v1/projects')
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('X-App-Token', appToken)
      .set('Origin', 'http://localhost:8080')
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        console.log(`listed:`);
        console.log((body.data as any[])[body.data.length - 1]);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.project.change) {
  it('it should change a project by id', (done) => {
    const requestData = {
      name: 'OtherProjectName'
    };

    request
      .put(`/v1/projects/${tempData.project.id}`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('X-App-Token', appToken)
      .set('Origin', 'http://localhost:8080')
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);

        expect(status).toBe(200);
        console.log(`change project id`);
        console.log(`${tempData.project.id}`);
        console.log((body.data as any));
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}


if (todoList.tool.add) {
  it('it should add a new tool', (done) => {
    const requestData = {
      'name': 'newSuperTool',
      'version': '1.0.0',
      'description': 'some description'
    }
    request
      .post('/v1/tools')
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        expect(typeof body.data).toBe('object');
        log(`added ${body.data.id}`);
        tempData.tool.id = body.data.id;
        done();
      });
  });
}

if (todoList.project.transcripts.upload) {
  it('it should upload a transcript and its mediafile', (done) => {
    request
      .post(`/v1/projects/${tempData.project.id}/transcripts/upload`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .attach('data', Buffer.from(JSON.stringify({
        orgtext: 'testorg',
        transcript: {
          test: 'ok'
        },
        media: {
          session: 'test263748'
        }
      }), 'utf-8'), 'data.json')
      .attach('media', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        tempData.mediaItem.uploadURL = body.data.file.url;
        tempData.transcript.id = body.data.id;
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.project.transcripts.changeStatus) {
  it('it should change status for each transcript id', (done) => {
    const payload: ProjectTranscriptsChangeStatusRequestItem[] = [
      {
        status: TranscriptStatus.free,
        listOfIds: [tempData.transcript.id]
      }
    ];

    request
      .put(`/v1/projects/${tempData.project.id}/transcripts/status/`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(payload)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        done();
      });
  });
}


if (todoList.annotation.start) {
  it('it should start a new annotation session', (done) => {
    const requestData = {
      tool_id: tempData.tool.id
    }

    // TODO API call to set transcript jobs to free
    request
      .post(`/v1/projects/${tempData.project.id}/annotations/start`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        console.log(body);
        tempData.transcript.id = body.data.id;

        expect(status).toBe(200);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.annotation.continue) {
  it('it should continue an old annotation session', (done) => {
    request
      .post(`/v1/projects/${tempData.project.id}/annotations/${tempData.transcript.id}/continue`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        console.log(body);

        expect(status).toBe(200);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.annotation.save) {
  it('it should save an annotation', (done) => {
    const requestData = {
      transcript: {},
      comment: 'Some comment',
      assessment: 'OK',
      log: [],
      tool_id: 44
    }

    request
      .post(`/v1/projects/${tempData.project.id}/annotations/${tempData.transcript.id}/save`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        console.log(body);
        expect(status).toBe(200);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.project.transcripts.getAll) {
  it('it should list an array of transcripts for a given project', (done) => {
    request
      .get(`/v1/projects/${tempData.project.id}/transcripts`)
      .set('Authorization', `Bearer ${tempData.user.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        log(`list of ${body.data.length} transcripts for project ${tempData.project.name}`);

        expect(status).toBe(200);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

/*
if (todoList.project.transcripts.get) {
  it('it should get an transcript by id', (done) => {
    request
      .get(`/v1/transcripts/${tempData.transcript.id}`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('X-App-Token', appToken)
      .set('Origin', 'http://localhost:8080')
      .end((err, {body, status}) => {
        checkForErrors(err, body);

        expect(status).toBe(200);
        log(`retrieved rows: ${body.data.length}`);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

*/

if (todoList.project.transcripts.get) {
  it('it should retrieve a transcript and its mediafile from project id', (done) => {
    request
      .get(`/v1/projects/${tempData.project.id}/transcripts/${tempData.transcript.id}/`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        tempData.mediaItem.url = body.data.file.url;
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}

if (todoList.project.transcripts.getAll) {
  it('it should retrieve all transcripts from project id by admin', (done) => {

    request
      .get(`/v1/projects/${tempData.project.id}/transcripts/`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send()
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        expect(status).toBe(200);
        expect(typeof body.data).toBe('object');
        done();
      });
  });
}


if (todoList.guidelines.save) {
  it('it should save guidelines', (done) => {
    const requestData = [{
      language: 'de',
      json: {
        test: 1232
      }
    }];

    request
      .put(`/v1/projects/${tempData.project.id}/guidelines/`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send(requestData)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        console.log(body);

        expect(status).toBe(200);
        done();
      });
  });
}

if (todoList.guidelines.get) {
  it('it should retrieve guidelines', (done) => {
    request
      .get(`/v1/projects/${tempData.project.id}/guidelines/`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        console.log(body);

        expect(status).toBe(200);
        done();
      });
  });
}

if (todoList.files.get) {
  it('it should retrieve a file from transcripts upload', (done) => {
    request
      .get(tempData.mediaItem.uploadURL.replace('http://localhost:8080', ''))
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        expect(status).toBe(200);
        done();
      });
  });
}

if (todoList.app.tokens.delete) {
  it('it should remove an app token', (done) => {
    request
      .delete(`/v1/app/tokens/${tempData.apptoken.addedID}`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);

        expect(status).toBe(200);
        done();
      });
  });
}

if (todoList.user.delete) {
  it('it should remove a user account', (done) => {
    request
      .delete(`/v1/users/${tempData.user.id}`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .end((err, {body, status}) => {
        checkForErrors(err, body);
        console.log(body);
        expect(status).toBe(200);

        done();
      });
  });
}

if (todoList.project.remove) {
  it('it should remove a project', (done) => {
    request
      .delete(`/v1/projects/${tempData.project.id}`)
      .set('Authorization', `Bearer ${tempData.admin.jwtToken}`)
      .set('Origin', 'http://localhost:8080')
      .set('X-App-Token', appToken)
      .send({
        removeAllReferences: true,
        cutAllReferences: false,
        removeProjectFiles: true
      })
      .end((err, {body, status}) => {
        checkForErrors(err, body);

        expect(status).toBe(200);
        done();
      });
  });
}

function log(str) {
  console.log(`\t[CHAI]: ${str}`);
}

function logJSON(json) {
  const jsonStr = JSON.stringify(json, null, 2);
  const array = jsonStr.split('\n');

  console.error(array.map(a => `\t${a}`).join('\n'));
}


function checkForErrors(err, body) {
  // console.log(body);
  // expect(err).toBeUndefined();
  if (err) {
    logError('ERROR: ');
    logError(err);
  }
  if (body) {
    if (body.status === 'error') {
      logError('ResponseError:\n' + JSON.stringify(body.message, null, 2));
    } else {
      expect(body.message).toBe(undefined);
      expect(body.status).toBe('success');
    }
  }

  // assert.equal(res.error, false, res.error.message);
}
