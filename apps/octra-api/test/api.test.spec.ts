//Require the dev-dependencies
import {OctraApi} from '../src/app/octra-api';

import * as supertest from 'supertest';
import {TranscriptStatus} from '@octra/db';
import path = require('path');

const relPath = path.join(__dirname, '..', 'src', 'config.json');
const app = new OctraApi().init('production', relPath);
const request = supertest(app);
jest.setTimeout(30000)

const doTest = (command, reqMethod, jwtToken, done, requestData, callback, addMethods) => {
  let req = reqMethod(command)
    .set('X-App-Token', `${appToken}`)
    .set('Origin', 'http://localhost:8080');

  if (jwtToken) {
    req = req.set('Authorization', `Bearer ${jwtToken}`)
  }

  if (addMethods) {
    req = addMethods(req);
  }

  if (requestData) {
    req = req.send(requestData);
  }

  req.end((err, {body, status}) => {
    checkForErrors(err, body);
    expect(body.status).toBe('success');
    callback({body, status});
    done();
  });
}

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
    doTest('/v1/users/register', request.post, undefined, done, {
      'name': tempData.user.name,
      'email': tempData.user.email,
      'password': 'Password12345'
    }, ({body}) => {
      tempData.user.jwtToken = body.token;
      console.log(body.token);
      tempData.user.id = body.data.id;
      expect(typeof body.data).toBe('object');
    }, undefined);
  });
}

if (todoList.user.login) {
  it('it should POST a user login', (done) => {
    doTest('/v1/users/login', request.post, undefined, done, {
      'name': 'Julian',
      'password': 'Test123'
    }, ({body}) => {
      expect(typeof body.data).toBe('object');
      tempData.admin.id = body.data.id;
      tempData.admin.jwtToken = body.token;
    }, undefined);
  });
}

if (todoList.user.assign) {
  it('it should assign user roles', (done) => {
    doTest(`/v1/users/${tempData.user.id}/roles`, request.post, tempData.admin.jwtToken, done, {
      role: 'user'
    }, ({body}) => {
    }, undefined);
  });
}

if (todoList.user.loginNormal) {
  it('it should POST a normal user login', (done) => {
    doTest('/v1/users/login', request.post, undefined, done, {
      'type': 'local',
      'name': tempData.user.name,
      'password': 'Password12345'
    }, ({body}) => {
      expect(typeof body.data).toBe('object');
      tempData.user.id = body.data.id;
      tempData.user.jwtToken = body.token;
    }, undefined);
  });
}

if (todoList.user.getUsers) {
  it('it should retrieve a list of users', (done) => {
    doTest('/v1/users', request.get, tempData.admin.jwtToken, done, undefined, ({body}) => {
      expect(typeof body.data).toBe('object');
      expect(Array.isArray(body.data)).toBe(true);
      log(`retrieved rows: ${body.data.length}`);
    }, undefined);
  });
}

if (todoList.user.getUserInfo) {
  it('it should retrieve information about a user by id', (done) => {
    doTest(`/v1/users/${tempData.user.id}`, request.get, tempData.admin.jwtToken, done, undefined, ({body}) => {
      expect(typeof body.data).toBe('object');
    }, undefined);
  });
}

if (todoList.user.getCurrentInfo) {
  it('it should retrieve information about the current user.', (done) => {
    doTest(`/v1/users/current`, request.get, tempData.user.jwtToken, done, undefined, ({body}) => {
      expect(typeof body.data).toBe('object');
    }, undefined);
  });
}

if (todoList.user.password.change) {
  it('it should change the password for the user logged in', (done) => {
    doTest(`/v1/users/password`, request.put, tempData.user.jwtToken, done, {
      oldPassword: 'Password12345',
      password: 'test12345'
    }, ({body, status}) => {
      const t = '';
    }, undefined);
  });
}

if (todoList.app.tokens.add) {
  it('it should save an app token to the database', (done) => {
    doTest(`/v1/app/tokens`, request.post, tempData.admin.jwtToken, done, {
      'name': 'Julian',
      'domain': 'localhost',
      'description': 'Neuer Key2'
    }, ({body}) => {
      expect(typeof body.data).toBe('object');
      tempData.apptoken.addedID = body.data.id;
      log(`added ${body.data.id}`);
    }, undefined);
  });
}

if (todoList.app.tokens.change) {
  it('it should change an app token', (done) => {
    doTest(`/v1/app/tokens/${tempData.apptoken.addedID}`, request.put, tempData.admin.jwtToken, done, {
      'name': 'Test Token',
      'domain': 'localhost',
      'description': 'Changed Key3'
    }, ({body}) => {
      log(`changed app token ${tempData.apptoken.addedID}`);
      expect(typeof body.data).toBe('object');
    }, undefined);
  });
}

if (todoList.app.tokens.refresh) {
  it('it should refresh an app token', (done) => {
    doTest(`/v1/app/tokens/${tempData.apptoken.addedID}/refresh`, request.put, tempData.admin.jwtToken, done, {}, ({body}) => {
      log(`refreshed app token ${tempData.apptoken.addedID}`);
      expect(typeof body.data).toBe('object');
    }, undefined);
  });
}

if (todoList.app.tokens.getList) {
  it('it should retrieve a list of app tokens', (done) => {
    doTest(`/v1/app/tokens`, request.get, tempData.admin.jwtToken, done, undefined, ({body}) => {
      log(`retrieved rows: ${body.data.length}`);
      expect(Array.isArray(body.data)).toBe(true);
    }, undefined);
  });
}


if (todoList.project.create) {
  tempData.project.name = 'TestProject_' + Date.now();
  it('it should create a project', (done) => {
    doTest('/v1/projects', request.post, tempData.admin.jwtToken, done, {
      'name': tempData.project.name,
      'description': 'arrsseiosdjp askdopasdk oakdsspoakdopaküpd akdspkapsdükapüds'
    }, ({body}) => {
      expect(typeof body.data).toBe('object');
      tempData.project.id = body.data.id;
    }, undefined);
  });
}

if (todoList.project.roles.assign) {
  it('it should assign user roles for a given project', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/roles/`, request.post, tempData.admin.jwtToken, done, [{
      userID: tempData.user.id,
      role: 'project_admin'
    }], ({body}) => {
    }, undefined);
  });
}

if (todoList.project.roles.assign) {
  it('it should change the user role of a specific user for a given project', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/roles/`, request.post, tempData.admin.jwtToken, done, [{
      userID: 798,
      role: 'transcriber'
    }], ({body}) => {
    }, undefined);
  });
}

if (todoList.project.get) {
  it('it should get a project by id', (done) => {
    doTest(`/v1/projects/${tempData.project.id}`, request.get, tempData.admin.jwtToken, done, undefined, ({body}) => {
      console.log(`get project id`);
      console.log(`${tempData.project.id}`);
      console.log((body.data as any));
      expect(typeof body.data).toBe('object');
    }, undefined);
  });
}

if (todoList.project.list) {
  it('it should list projects', (done) => {
    doTest('/v1/projects', request.get, tempData.admin.jwtToken, done, undefined, ({body}) => {
      console.log(`listed:`);
      console.log((body.data as any[])[body.data.length - 1]);
      expect(typeof body.data).toBe('object');
    }, undefined);
  });
}

if (todoList.project.change) {
  it('it should change a project by id', (done) => {
    doTest(`/v1/projects/${tempData.project.id}`, request.put, tempData.admin.jwtToken, done, {
      name: 'OtherProjectName'
    }, ({body}) => {
      console.log(`change project id`);
      console.log(`${tempData.project.id}`);
      console.log((body.data as any));
      expect(typeof body.data).toBe('object');
    }, undefined);
  });
}


if (todoList.tool.add) {
  it('it should add a new tool', (done) => {
    doTest('/v1/tools', request.post, tempData.admin.jwtToken, done, {
      'name': 'newSuperTool',
      'version': '1.0.0',
      'description': 'some description'
    }, ({body}) => {
      expect(typeof body.data).toBe('object');
      log(`added ${body.data.id}`);
      tempData.tool.id = body.data.id;
    }, undefined);
  });
}

if (todoList.project.transcripts.upload) {
  it('it should upload a transcript and its mediafile', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/transcripts/upload`, request.post, tempData.admin.jwtToken, done, undefined, ({body}) => {
      tempData.mediaItem.uploadURL = body.data.file.url;
      tempData.transcript.id = body.data.id;
      expect(typeof body.data).toBe('object');
    }, (req) => {
      return req.attach('data', Buffer.from(JSON.stringify({
        orgtext: 'testorg',
        transcript: {
          test: 'ok'
        },
        media: {
          session: 'test263748'
        }
      }), 'utf-8'), 'data.json')
        .attach('media', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav');
    });
  });
}

if (todoList.project.transcripts.changeStatus) {
  it('it should change status for each transcript id', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/transcripts/status/`, request.put, tempData.admin.jwtToken, done, [
      {
        status: TranscriptStatus.free,
        listOfIds: [tempData.transcript.id]
      }
    ], ({body}) => {
    }, undefined);
  });
}


if (todoList.annotation.start) {
  it('it should start a new annotation session', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/annotations/start`, request.post, tempData.admin.jwtToken, done, {
      tool_id: tempData.tool.id
    }, ({body}) => {
      console.log(body);
      expect(typeof body.data).toBe('object');
      tempData.transcript.id = body.data.id;
    }, undefined);
  });
}

if (todoList.annotation.continue) {
  it('it should continue an old annotation session', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/annotations/${tempData.transcript.id}/continue`, request.post, tempData.admin.jwtToken, done, undefined, ({body}) => {
      console.log(body);
    }, undefined);
  });
}

if (todoList.annotation.save) {
  it('it should save an annotation', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/annotations/${tempData.transcript.id}/save`, request.post, tempData.admin.jwtToken, done, {
      transcript: {},
      comment: 'Some comment',
      assessment: 'OK',
      log: [],
      tool_id: 44
    }, ({body}) => {
      console.log(body);
    }, undefined);
  });
}

if (todoList.project.transcripts.getAll) {
  it('it should list an array of transcripts for a given project', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/transcripts`, request.get, tempData.admin.jwtToken, done, undefined, ({body}) => {
      log(`list of ${body.data.length} transcripts for project ${tempData.project.name}`);
    }, undefined);
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
    doTest(`/v1/projects/${tempData.project.id}/transcripts/${tempData.transcript.id}/`, request.get, tempData.admin.jwtToken, done, undefined, ({body}) => {
      tempData.mediaItem.url = body.data.file.url;
      expect(typeof body.data).toBe('object');
    }, undefined);
  });
}

if (todoList.project.transcripts.getAll) {
  it('it should retrieve all transcripts from project id by admin', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/transcripts/`, request.get, tempData.admin.jwtToken, done, undefined, ({body}) => {
      expect(typeof body.data).toBe('object');
    }, undefined);
  });
}


if (todoList.guidelines.save) {
  it('it should save guidelines', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/guidelines/`, request.put, tempData.admin.jwtToken, done, [{
      language: 'de',
      json: {
        test: 1232
      }
    }], ({body}) => {
      console.log(body);
    }, undefined);
  });
}

if (todoList.guidelines.get) {
  it('it should retrieve guidelines', (done) => {
    doTest(`/v1/projects/${tempData.project.id}/guidelines/`, request.get, tempData.admin.jwtToken, done, undefined, ({body}) => {
      console.log(body);
    }, undefined);
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
    doTest(`/v1/app/tokens/${tempData.apptoken.addedID}`, request.delete, tempData.admin.jwtToken, done, undefined, ({body}) => {
    }, undefined);
  });
}

if (todoList.user.delete) {
  it('it should remove a user account', (done) => {
    doTest(`/v1/users/${tempData.user.id}`, request.delete, tempData.admin.jwtToken, done, undefined, ({body}) => {
      console.log(body);
    }, undefined);
  });
}

if (todoList.project.remove) {
  it('it should remove a project', (done) => {
    doTest(`/v1/projects/${tempData.project.id}`, request.delete, tempData.admin.jwtToken, done, {
      removeAllReferences: true,
      cutAllReferences: false,
      removeProjectFiles: true
    }, ({body}) => {
      console.log(body);
    }, undefined);
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
