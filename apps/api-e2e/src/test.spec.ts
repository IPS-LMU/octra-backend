import {Test, TestingModule} from '@nestjs/testing';
import * as request from 'supertest';
import * as fs from 'fs';
import {AppModule} from '../../api/src/app/app.module';
import {AuthDto} from '../../api/src/app/core/authentication/auth.dto';
import {AppTokenDto} from '../../api/src/app/core/app-token/app-token.dto';
import {BadRequestException, ValidationPipe} from '@nestjs/common';
import {ValidationError} from 'class-validator';
import {
  AccountCreateRequestDto,
  AccountDto,
  AccountRegisterRequestDto,
  AssignRoleDto,
  ChangePasswordDto
} from '../../api/src/app/core/account/account.dto';
import {ProjectRequestDto, ProjectRoleDto} from '../../api/src/app/core/project/project.dto';
import {AccountLoginMethod, AccountRole, ProjectVisibility} from '@octra/api-types';
import {ToolCreateRequestDto, ToolDto} from '../../api/src/app/core/tool/tool.dto';
import {TaskDto, TaskProperties} from '../../api/src/app/core/project/tasks';
import {SaveAnnotationDto} from '../../api/src/app/core/project/annotations/annotation.dto';
import {GuidelinesDto} from 'apps/api/src/app/core/project/guidelines/guidelines.dto';
import {AnnotJSONType, TranscriptDto} from '@octra/server-side';

const tempData = {
  apptoken: {
    addedID: '0',
    removedID: '0'
  },
  admin: {
    id: '0',
    jwtToken: ''
  },
  user: {
    id: '0',
    name: 'TestUser_' + Date.now(),
    email: 'testemail@testtest.de',
    jwtToken: ''
  },
  project: {
    id: '0',
    name: ''
  },
  mediaItem: {
    id: '0',
    uploadURL: '',
    url: '',
    delivery_url: ''
  },
  task: {
    id: '0'
  },
  tool: {
    id: '0'
  }
};
let app;
const appToken = 'a810c2e6e76774fadf03d8edd1fc9d1954cc27d6';

console.log('configPath: ' + process.env.configPath);

fs.mkdirSync('./data/files/tmp/', {recursive: true});
fs.writeFileSync('./data/files/tmp/test.json', JSON.stringify({
  sampleRate: 16000,
  levels: [{
    name: 'Test Level local',
    type: AnnotJSONType.SEGMENT,
    items: [{
      id: 1,
      label: 'test',
      value: 'this is a file test'
    }]
  }]
}), {
  encoding: 'utf-8'
});

fs.writeFileSync('./data/files/tmp/test.txt', 'this is a test', {
  encoding: 'utf-8'
});

fs.writeFileSync('./data/files/tmp/test2.json', JSON.stringify({
  sampleRate: 16000,
  levels: [{
    name: 'Test Level local Test2',
    type: AnnotJSONType.SEGMENT,
    items: [{
      id: 1,
      label: 'test',
      value: 'this is a file test2'
    }]
  }]
}), {
  encoding: 'utf-8'
});

fs.writeFileSync('./data/files/tmp/test2.txt', 'this is a test2', {
  encoding: 'utf-8'
});

const authGet = (url: string, isAdmin = true) => {
  return request(app.getHttpServer()).get(url)
    .set('X-App-Token', `${appToken}`)
    .set('Origin', 'http://localhost:8080')
    .auth(
      isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
      , {type: 'bearer'}).send();
}
const authPost = (url: string, data: any, isAdmin = true) => {
  return request(app.getHttpServer()).post(url)
    .set('X-App-Token', `${appToken}`)
    .set('Origin', 'http://localhost:8080')
    .auth(
      isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
      , {type: 'bearer'}).send(data);
}

const authPut = (url: string, data: any, isAdmin = true) => {
  return request(app.getHttpServer()).put(url)
    .set('X-App-Token', `${appToken}`)
    .set('Origin', 'http://localhost:8080')
    .auth(
      isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
      , {type: 'bearer'}).send(data);
}
const authDelete = (url: string, data: any, isAdmin = true) => {
  return request(app.getHttpServer()).delete(url)
    .set('X-App-Token', `${appToken}`)
    .set('Origin', 'http://localhost:8080')
    .auth(
      isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
      , {type: 'bearer'}).send(data);
}

describe('OCTRA Nest API (e2e)', () => {
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      disableErrorMessages: false,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        console.error(JSON.stringify(validationErrors, null, 2));
        return new BadRequestException(validationErrors);
      }
    }));
    await app.init();
  });

  describe('Registration', () => {
    tempData.user.name = `TestAccount_${Date.now()}`;
    tempData.user.email = `test_${Date.now()}@email.com`;
    it('/account/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/account/register').send({
          'name': tempData.user.name,
          'password': 'Test1234',
          'email': tempData.user.email
        } as AccountRegisterRequestDto)
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .expect(201).then(({body}: { body: AccountDto }) => {
          tempData.user.id = body.id;
        })
    });
  })

  describe('Authentication', () => {
    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login').send({
          'username': 'Julian',
          'password': 'Test123',
          'type': AccountLoginMethod.local
        })
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .expect(201).then(({body}: { body: AuthDto }) => {
          tempData.admin.jwtToken = body.accessToken;
          tempData.admin.id = body.account.id;
        }).catch((e) => {
          console.log(e)
        })
    });

    it('/account/ (POST)', () => {
      tempData.user.name = `TestAccount_${Date.now()}_delivery`;
      tempData.user.email = `test_${Date.now()}_delivery@email.com`;

      return authPost('/account', {
        'name': tempData.user.name,
        'password': 'Test1234',
        'email': tempData.user.email,
        role: 'data_delivery'
      } as AccountCreateRequestDto)
        .expect(201).then(({body}: { body: AccountDto }) => {
          if (typeof body !== 'object') {
            throw new Error('Body must be of type object.');
          }
        });
    });


    it('/authentication/login (POST) (user)', () => {
      return request(app.getHttpServer())
        .post('/auth/login').send({
          'username': tempData.user.name,
          'password': 'Test1234',
          'type': AccountLoginMethod.local
        })
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .expect(201).then(({body}: { body: AuthDto }) => {
          tempData.user.jwtToken = body.accessToken;
          tempData.user.id = body.account.id;
        })
    });
  })

  describe('Tools', () => {
    it('/tool/ (POST)', () => {
      return authPost('/tool', {
        name: `Tool_${Date.now()}`,
        version: '1.0.0',
        description: 'some description'
      } as ToolCreateRequestDto)
        .expect(201).then(({body}: { body: ToolDto }) => {
          if (typeof body !== 'object') {
            throw new Error('Body must be of type object.');
          }
        });
    });
    it('/tool/ (DELETE)', () => {
      return authDelete(`/tool/${tempData.tool.id}`, undefined)
        .expect(200);
    });
  })

  describe('AppTokens', () => {
    it('/app/tokens (GET)', () => {
      return authGet('/app/tokens').expect(200).then(({body}) => {
        if (!Array.isArray(body)) {
          throw new Error('Body must be of type array.');
        }
      })
    });

    it('/app/tokens (POST)', () => {
      const dto = {
        description: 'Test description',
        domain: 'fgdfg',
        key: 'sdfgdfgdfgdfgdfgsgf_' + Date.now(),
        name: 'test',
        registrations: false
      };
      return authPost('/app/tokens', dto).expect(201).then(({body}: { body: AppTokenDto }) => {
        tempData.apptoken.addedID = body.id;
      });
    });

    it('/app/tokens/:id (PUT)', () => {
      const dto = {
        description: 'Test description',
        domain: 'fgdfg',
        key: 'sdfgdfgdfgdfgdfgsgf_' + Date.now(),
        registrations: true
      };
      return authPut(`/app/tokens/${tempData.apptoken.addedID}`, dto).expect(200);
    });


    it('/app/tokens/:id/refresh (PUT)', () => {
      return authPut(`/app/tokens/${tempData.apptoken.addedID}/refresh`, undefined).expect(200);
    });

    it('/app/tokens/:id (DELETE)', () => {
      return authDelete(`/app/tokens/${tempData.apptoken.addedID}`, undefined).expect(200);
    });
  })
});

describe('Accounts', () => {
  it('/account/ (GET)', () => {
    return authGet('/account/').expect(200).then(({body}) => {
      if (!Array.isArray(body)) {
        throw new Error('Body must be of type array.');
      }
    })
  });
  it('/account/current (GET)', () => {
    return authGet('/account/current').expect(200).then(({body}) => {
      if (body === undefined) {
        throw new Error('Body must be of type array.');
      }
    })
  });

  it('/account/password (PUT)', () => {
    return authPut('/account/password', {
      oldPassword: 'Test123',
      newPassword: 'Test123'
    } as ChangePasswordDto).expect(200);
  });

  it('/account/hash (GET)', () => {
    return request(app.getHttpServer())
      .get('/account/hash/b07e7c6156b937d17d55362793052f225571764e7f6cf2a15742a534319ee7c6')
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .expect(200);
  });


  it('/account/:id (GET)', () => {
    return authGet(`/account/${tempData.user.id}`).expect(200).then(({body}) => {
      if (body === undefined) {
        throw new Error('Body must be of type array.');
      }
    });
  });
});

describe('Projects', () => {
  it('/projects/ (GET)', () => {
    return authGet('/projects/').expect(200).then(({body}) => {
      if (!Array.isArray(body)) {
        throw new Error('Body must be of type array.');
      }
    })
  });

  tempData.project.name = 'TestProject_' + Date.now();
  it('/projects/ (POST)', () => {
    return authPost('/projects/', {
      'name': tempData.project.name,
      shortname: `${tempData.project.name}_short`,
      visibility: ProjectVisibility.private,
      'description': 'test description'
    } as ProjectRequestDto).expect(201).then(({body}) => {
      if (!body) {
        throw new Error('Body must be of type array.');
      }
      tempData.project.id = body.id;
    }).catch((e) => {
      throw Error(e);
    });
  });

  it('/projects/:id/roles (POST)', () => {
    return authPost(`/projects/${tempData.project.id}/roles`, [{
      account_id: tempData.user.id,
      role: AccountRole.projectAdministrator,
      valid_startdate: new Date().toISOString(),
      valid_enddate: new Date().toISOString()
    }] as ProjectRoleDto[]).expect((a) => a.status === 200 || a.status === 201).then((({body}) => {
      const t = body;
    }));
  });

  it('/projects/ (GET) (ProjectAdmin)', () => {
    return authGet('/projects/', false).expect(200).then(({body}) => {
      if (!Array.isArray(body)) {
        throw new Error('Body must be of type array.');
      }
    })
  });

  it('/account/:id/roles (PUT)', () => {
    return authPut(`/account/${tempData.user.id}/roles`, {
      general: AccountRole.user,
      projects: [
        {
          project_id: tempData.project.id,
          role: AccountRole.projectAdministrator
        }
      ]
    } as AssignRoleDto, true).expect(200).then(({body}) => {
      if (!Array.isArray(body.projects)) {
        throw new Error('Body must be of type array.');
      }
    })
  });

  it('/projects/:id/roles (GET)', () => {
    return authGet(`/projects/${tempData.project.id}/roles`, false).expect(200).then(({body}) => {
        const t = '';
      }
    )
  });

  it('/projects/:id (GET)', () => {
    return authGet(`/projects/${tempData.project.id}`, false).expect(200).then(({body}) => {
        const t = '';
      }
    )
  });

  it('/projects/:id/guidelines (PUT)', () => {
    return authPut(`/projects/${tempData.project.id}/guidelines`, [{
      language: 'de',
      json: {
        test: 'ok'
      }
    }] as GuidelinesDto[]).expect(200);
  });

  it('/projects/:id/guidelines (GET)', () => {
    return authGet(`/projects/${tempData.project.id}/guidelines`).expect(200).then(({body}) => {
      if (!Array.isArray(body)) {
        throw new Error(`Body must be of type array.`)
      }
    });
  });

  it('/projects/:id/tasks (POST)', () => {
    return request(app.getHttpServer()).post(`/projects/${tempData.project.id}/tasks/`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        orgtext: 'asdas'
      }))
      .field('transcriptType', 'AnnotJSON')
      .field('transcript', JSON.stringify({
        sampleRate: 16000,
        levels: [{
          name: 'Test Level local',
          type: AnnotJSONType.SEGMENT,
          items: []
        }]
      }))
      .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
      .auth(tempData.admin.jwtToken, {type: 'bearer'})
      .expect(201).then(({body}: { body: TaskDto }) => {
        tempData.task.id = body.id;
      })
  });

  it('/projects/:id/tasks (POST) (no transcript)', () => {
    return request(app.getHttpServer()).post(`/projects/${tempData.project.id}/tasks/`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        orgtext: 'asdas'
      }))
      .field('transcriptType', 'AnnotJSON')
      .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
      .auth(tempData.admin.jwtToken, {type: 'bearer'})
      .expect(201).then(({body}: { body: TaskDto }) => {
        tempData.task.id = body.id;
      })
  });

  it('/projects/:id/tasks (POST) (transcript file, JSON)', () => {
    return request(app.getHttpServer()).post(`/projects/${tempData.project.id}/tasks/`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        orgtext: 'asdas'
      }))
      .field('transcriptType', 'AnnotJSON')
      .attach('inputs[]', './data/files/tmp/test.json', 'test.json')
      .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
      .auth(tempData.admin.jwtToken, {type: 'bearer'})
      .expect(201).then(({body}: { body: TaskDto }) => {
        tempData.task.id = body.id;
        tempData.mediaItem.uploadURL = body.inputs[0].url;
        const t = '';
      })
  });

  it('/projects/:id/tasks (POST) (transcript file, Text)', () => {
    return request(app.getHttpServer()).post(`/projects/${tempData.project.id}/tasks/`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        orgtext: 'asdas'
      }))
      .field('transcriptType', 'Text')
      .attach('inputs[]', './data/files/tmp/test.txt', 'test.txt')
      .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
      .auth(tempData.admin.jwtToken, {type: 'bearer'})
      .expect(201).then(({body}: { body: TaskDto }) => {
        tempData.task.id = body.id;
      })
  });

  it('/projects/:id/tasks/:task_id (PUT) transcript AnnotJSON', () => {
    return request(app.getHttpServer()).put(`/projects/${tempData.project.id}/tasks/${tempData.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok'
      } as TaskProperties))
      .field('transcriptType', 'AnnotJSON')
      .field('transcript', JSON.stringify({
        sampleRate: 16000,
        levels: [{
          name: 'Test Level3',
          type: AnnotJSONType.SEGMENT,
          items: []
        }]
      } as TranscriptDto))
      .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
      .auth(tempData.admin.jwtToken, {type: 'bearer'})
      .expect(200).then(({body}: { body: TaskDto }) => {
        tempData.task.id = body.id;
      })
  });

  it('/projects/:id/tasks/:task_id (PUT) transcript Text', () => {
    return request(app.getHttpServer()).put(`/projects/${tempData.project.id}/tasks/${tempData.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok'
      } as TaskProperties))
      .field('transcriptType', 'Text')
      .field('transcript', 'this is a test inline transcript')
      .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
      .auth(tempData.admin.jwtToken, {type: 'bearer'})
      .expect(200).then(({body}: { body: TaskDto }) => {
        tempData.task.id = body.id;
      })
  });

  it('/projects/:id/tasks/:task_id (PUT) no transcript', () => {
    return request(app.getHttpServer()).put(`/projects/${tempData.project.id}/tasks/${tempData.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok2'
      } as TaskProperties))
      .field('transcriptType', 'AnnotJSON')
      .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
      .auth(tempData.admin.jwtToken, {type: 'bearer'})
      .expect(200).then(({body}: { body: TaskDto }) => {
        tempData.task.id = body.id;
      })
  });

  it('/projects/:id/tasks/:task_id (PUT) transcript file JSON', () => {
    return request(app.getHttpServer()).put(`/projects/${tempData.project.id}/tasks/${tempData.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok2',
        status: 'FREE'
      } as TaskProperties))
      .field('transcriptType', 'AnnotJSON')
      .attach('inputs[]', './data/files/tmp/test2.json', 'test2.json')
      .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
      .auth(tempData.admin.jwtToken, {type: 'bearer'})
      .expect(200).then(({body}: { body: TaskDto }) => {
        tempData.task.id = body.id;
      })
  });

  it('/projects/:id/tasks/:task_id (PUT) transcript file Text', () => {
    return request(app.getHttpServer()).put(`/projects/${tempData.project.id}/tasks/${tempData.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok2',
        status: 'BUSY'
      } as TaskProperties))
      .field('transcriptType', 'Text')
      .attach('inputs[]', './data/files/tmp/test2.txt', 'test2.txt')
      .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
      .auth(tempData.admin.jwtToken, {type: 'bearer'})
      .expect(200).then(({body}: { body: TaskDto }) => {
        tempData.task.id = body.id;
      })
  });

  it('/projects/:id/tasks/:task_id (PUT) without inputs', () => {
    return request(app.getHttpServer()).put(`/projects/${tempData.project.id}/tasks/${tempData.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok3',
        status: 'FREE'
      } as TaskProperties))
      .field('transcriptType', 'Text')
      .auth(tempData.admin.jwtToken, {type: 'bearer'})
      .expect(200).then(({body}: { body: TaskDto }) => {
        tempData.task.id = body.id;
      })
  });

  it('/projects/project_id/:id/tasks/:task_id (GET)', () => {
    return authGet(`/projects/${tempData.project.id}/tasks/${tempData.task.id}`).expect(200);
  });

  it('/projects/project_id/:id/tasks/ (GET)', () => {
    return authGet(`/projects/${tempData.project.id}/tasks/`).expect(200).then(({body}) => {
      const t = body;
    });
  });

  it('/projects/project_id/annotations/start/ (POST)', () => {
    return authPost(`/projects/${tempData.project.id}/annotations/start`, undefined).expect(201).then(({body}) => {
      tempData.task.id = body.id;
    });
  });

  it('/projects/:project_id/annotations/:task_id/continue/ (POST)', () => {
    return authPut(`/projects/${tempData.project.id}/annotations/${tempData.task.id}/continue`, undefined).expect(200).then(({body}) => {
      tempData.task.id = body.id;
    }).catch((a) => {
      const t = a;
    });
  });

  it('/projects/project_id/annotations/save/ (PUT)', () => {
    return authPut(`/projects/${tempData.project.id}/annotations/${tempData.task.id}/save`, {
      assessment: 'assessment', code: 'code', comment: 'comment', log: [{
        name: 'tzas',
        value: 'uiahs'
      }], orgtext: 'orgtext', transcript: {
        sampleRate: 16000,
        levels: [{
          name: 'OCTRA',
          type: AnnotJSONType.SEGMENT,
          items: [{
            id: 1,
            sampleStart: 0,
            sampleDur: 1000,
            labels: [{
              name: 'OCTRA',
              value: 'test'
            }]
          }]
        }]
      },
      pid: 'test'
    } as SaveAnnotationDto).expect(200).then(({body}) => {
      const t = body;
    }).catch((e) => {
      console.log(e);
    });
  });

  it('/projects/:project_id/annotations/:task_id/resume/ (POST)', () => {
    return authPut(`/projects/${tempData.project.id}/annotations/${tempData.task.id}/resume`, undefined).expect(200).then(({body}) => {
      tempData.task.id = body.id;
    }).catch((a) => {
      const t = a;
    });
  });

  it('/projects/project_id/annotations/free/ (POST)', () => {
    return authPut(`/projects/${tempData.project.id}/annotations/${tempData.task.id}/free`, undefined).expect(200).then(({body}) => {
      tempData.task.id = body.id;
    }).catch((a) => {
      const t = a;
    });
  });
  /*
    it('/projects/project_id/:id/tasks/:task_id (DELETE)', () => {
      return authDelete(`/projects/${tempData.project.id}/tasks/${tempData.task.id}`, undefined).expect(200);
    });

    it('/projects/:id (DELETE)', () => {
      return authDelete(`/projects/${tempData.project.id}`, {
        cutAllReferences: false,
        removeAllReferences: true,
        removeProjectFiles: true
      } as ProjectRemoveRequestDto).expect(200);
    });

    it('/account/:id (DELETE)', () => {
      return authDelete(`/account/${tempData.user.id}`, undefined).expect(200);
    });

   */
});
