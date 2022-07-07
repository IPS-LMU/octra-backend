import {Test, TestingModule} from '@nestjs/testing';
import * as request from 'supertest';
import {AppModule} from '../../api/src/app/app.module';
import {AuthDto} from '../../api/src/app/core/authentication/auth.dto';
import {AppTokenDto} from '../../api/src/app/core/app-token/app-token.dto';
import {BadRequestException, ValidationPipe} from '@nestjs/common';
import {ValidationError} from 'class-validator';
import {
  AccountDto,
  AccountRegisterRequestDto,
  AssignRoleDto,
  ChangePasswordDto
} from '../../api/src/app/core/account/account.dto';
import {ProjectRequestDto, ProjectRoleDto} from '../../api/src/app/core/project/project.dto';
import {AccountLoginMethod, AccountRole, ProjectRemoveRequestDto, ProjectVisibility} from '@octra/api-types';
import {ToolCreateRequestDto, ToolDto} from '../../api/src/app/core/tool/tool.dto';
import {TaskDto, TaskProperties} from '../../api/src/app/core/project/tasks';
import {SaveAnnotationDto} from '../../api/src/app/core/project/annotations/annotation.dto';
import {GuidelinesDto} from 'apps/api/src/app/core/project/guidelines/guidelines.dto';
import {AnnotJSONType, TranscriptDto} from '@octra/server-side';
import {GeneralSettingsDto} from '../../api/src/app/core/settings/settings.dto';
import {appToken, testState} from './core/globals';
import {Auth} from './core/functions';

let app;

describe('OCTRA Nest API admin (e2e)', () => {
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
    Auth.init(app);
  });

  describe('Registration', () => {
    testState.user.name = `TestAccount_${Date.now()}`;
    testState.user.email = `test_${Date.now()}@email.com`;
    it('/account/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/account/register').send({
          'name': testState.user.name,
          'password': 'Test123',
          'email': testState.user.email
        } as AccountRegisterRequestDto)
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .expect(201).then(({body}: { body: AccountDto }) => {
          testState.user.id = body.id;
        })
    });
  })


  describe.only('Authentication', () => {
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
          testState.admin.jwtToken = body.accessToken;
          testState.admin.id = body.account.id;
        }).catch((e) => {
          console.log(e)
        })
    });

  });

  describe('Tools', () => {
    it('/tool/ (POST)', () => {
      return Auth.post('/tool', {
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
      return Auth.delete(`/tool/${testState.tool.id}`, undefined)
        .expect(200);
    });
  })

  describe('AppTokens', () => {
    it('/app/tokens (GET)', () => {
      return Auth.get('/app/tokens').expect(200).then(({body}) => {
        if (!Array.isArray(body)) {
          throw new Error('Body must be of type array.');
        }
      })
    });

    it('/app/tokens (POST)', () => {
      const dto = {
        description: 'Test description',
        domain: 'fgdfg',
        name: 'test',
        registrations: false
      };
      return Auth.post('/app/tokens', dto).expect(201).then(({body}: { body: AppTokenDto }) => {
        testState.apptoken.addedID = body.id;
      });
    });

    it('/app/tokens/:id (PUT)', () => {
      const dto = {
        description: 'Test description',
        domain: 'fgdfg',
        registrations: true
      };
      return Auth.put(`/app/tokens/${testState.apptoken.addedID}`, dto).expect(200);
    });


    it('/app/tokens/:id/refresh (PUT)', () => {
      return Auth.put(`/app/tokens/${testState.apptoken.addedID}/refresh`, undefined).expect(200);
    });

    it('/app/tokens/:id (DELETE)', () => {
      return Auth.delete(`/app/tokens/${testState.apptoken.addedID}`, undefined).expect(200);
    });
  });

  describe('Accounts', () => {
    it('/account/ (GET)', () => {
      return Auth.get('/account/').expect(200).then(({body}) => {
        if (!Array.isArray(body)) {
          throw new Error('Body must be of type array.');
        }
      })
    });
    it('/account/current (GET)', () => {
      return Auth.get('/account/current').expect(200).then(({body}) => {
        if (body === undefined) {
          throw new Error('Body must be of type array.');
        }
      })
    });

    it('/account/password (PUT)', () => {
      return Auth.put('/account/password', {
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
      return Auth.get(`/account/${testState.admin.id}`).expect(200).then(({body}) => {
        if (body === undefined) {
          throw new Error('Body must be of type array.');
        }
      });
    });
  });

  describe('Projects', () => {
    it('/projects/ (GET)', () => {
      return Auth.get('/projects/').expect(200).then(({body}) => {
        if (!Array.isArray(body)) {
          throw new Error('Body must be of type array.');
        }
      })
    });

    testState.project.name = 'TestProject_' + Date.now();
    it('/projects/ (POST)', () => {
      return Auth.post('/projects/', {
        'name': testState.project.name,
        shortname: `${testState.project.name}_short`,
        visibility: ProjectVisibility.private,
        'description': 'test description'
      } as ProjectRequestDto).expect(201).then(({body}) => {
        if (!body) {
          throw new Error('Body must be of type array.');
        }
        testState.project.id = body.id;
      }).catch((e) => {
        throw Error(e);
      });
    });

    it('/projects/:id/roles (POST)', () => {
      return Auth.post(`/projects/${testState.project.id}/roles`, [{
        account_id: testState.user.id,
        role: AccountRole.projectAdministrator,
        valid_startdate: new Date().toISOString(),
        valid_enddate: new Date().toISOString()
      }] as ProjectRoleDto[]).expect((a) => a.status === 200 || a.status === 201).then((({body}) => {
        const t = body;
      }));
    });

    it('/account/:id/roles (PUT)', () => {
      return Auth.put(`/account/${testState.user.id}/roles`, {
        general: AccountRole.user,
        projects: [
          {
            project_id: testState.project.id,
            role: AccountRole.projectAdministrator
          }
        ]
      } as AssignRoleDto, true).expect(200).then(({body}) => {
        if (!Array.isArray(body.projects)) {
          throw new Error('Body must be of type array.');
        }
      })
    });

    it('/projects/:id/guidelines (PUT)', () => {
      return Auth.put(`/projects/${testState.project.id}/guidelines`, [{
        language: 'de',
        json: {
          test: 'ok'
        }
      }] as GuidelinesDto[]).expect(200);
    });

    it('/projects/:id/guidelines (GET)', () => {
      return Auth.get(`/projects/${testState.project.id}/guidelines`).expect(200).then(({body}) => {
        if (!Array.isArray(body)) {
          throw new Error(`Body must be of type array.`)
        }
      });
    });

    it('/projects/:id/tasks (POST)', () => {
      return request(app.getHttpServer()).post(`/projects/${testState.project.id}/tasks/`)
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .field('properties', JSON.stringify({
          type: 'annotation',
          orgtext: 'asdas',
          files_destination: 'test/../../../test2'
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
        .auth(testState.admin.jwtToken, {type: 'bearer'})
        .expect(201).then(({body}: { body: TaskDto }) => {
          testState.task.id = body.id;
          testState.mediaItem.url = body.inputs[0].url;
        })
    });

    it('/projects/:id/tasks (POST) (no transcript)', () => {
      return request(app.getHttpServer()).post(`/projects/${testState.project.id}/tasks/`)
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .field('properties', JSON.stringify({
          type: 'annotation',
          orgtext: 'asdas',
          files_destination: 'test/../../../test3'
        }))
        .field('transcriptType', 'AnnotJSON')
        .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
        .auth(testState.admin.jwtToken, {type: 'bearer'})
        .expect(201).then(({body}: { body: TaskDto }) => {
          testState.task.id = body.id;
        })
    });

    it('/projects/:id/tasks (POST) (transcript file, JSON)', () => {
      return request(app.getHttpServer()).post(`/projects/${testState.project.id}/tasks/`)
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .field('properties', JSON.stringify({
          type: 'annotation',
          orgtext: 'asdas'
        }))
        .field('transcriptType', 'AnnotJSON')
        .attach('inputs[]', './data/files/tmp/test.json', 'test.json')
        .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
        .auth(testState.admin.jwtToken, {type: 'bearer'})
        .expect(201).then(({body}: { body: TaskDto }) => {
          testState.task.id = body.id;
          testState.mediaItem.uploadURL = body.inputs[0].url;
          const t = '';
        })
    });

    it('/projects/:id/tasks (POST) (transcript file, Text)', () => {
      return request(app.getHttpServer()).post(`/projects/${testState.project.id}/tasks/`)
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .field('properties', JSON.stringify({
          type: 'annotation',
          orgtext: 'asdas'
        }))
        .field('transcriptType', 'Text')
        .attach('inputs[]', './data/files/tmp/test.txt', 'test.txt')
        .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
        .auth(testState.admin.jwtToken, {type: 'bearer'})
        .expect(201).then(({body}: { body: TaskDto }) => {
          testState.task.id = body.id;
        })
    });

    it('/projects/:id/tasks/:task_id (PUT) transcript AnnotJSON', () => {
      return request(app.getHttpServer()).put(`/projects/${testState.project.id}/tasks/${testState.task.id}`)
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
        .auth(testState.admin.jwtToken, {type: 'bearer'})
        .expect(200).then(({body}: { body: TaskDto }) => {
          testState.task.id = body.id;
        })
    });

    it('/projects/:id/tasks/:task_id (PUT) transcript Text', () => {
      return request(app.getHttpServer()).put(`/projects/${testState.project.id}/tasks/${testState.task.id}`)
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .field('properties', JSON.stringify({
          type: 'annotation',
          assessment: 'ok'
        } as TaskProperties))
        .field('transcriptType', 'Text')
        .field('transcript', 'this is a test inline transcript')
        .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
        .auth(testState.admin.jwtToken, {type: 'bearer'})
        .expect(200).then(({body}: { body: TaskDto }) => {
          testState.task.id = body.id;
        })
    });

    it('/projects/:id/tasks/:task_id (PUT) no transcript', () => {
      return request(app.getHttpServer()).put(`/projects/${testState.project.id}/tasks/${testState.task.id}`)
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .field('properties', JSON.stringify({
          type: 'annotation',
          assessment: 'ok2'
        } as TaskProperties))
        .field('transcriptType', 'AnnotJSON')
        .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
        .auth(testState.admin.jwtToken, {type: 'bearer'})
        .expect(200).then(({body}: { body: TaskDto }) => {
          testState.task.id = body.id;
        })
    });

    it('/projects/:id/tasks/:task_id (PUT) transcript file JSON', () => {
      return request(app.getHttpServer()).put(`/projects/${testState.project.id}/tasks/${testState.task.id}`)
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
        .auth(testState.admin.jwtToken, {type: 'bearer'})
        .expect(200).then(({body}: { body: TaskDto }) => {
          testState.task.id = body.id;
        })
    });

    it('/projects/:id/tasks/:task_id (PUT) transcript file Text', () => {
      return request(app.getHttpServer()).put(`/projects/${testState.project.id}/tasks/${testState.task.id}`)
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
        .auth(testState.admin.jwtToken, {type: 'bearer'})
        .expect(200).then(({body}: { body: TaskDto }) => {
          testState.task.id = body.id;
        })
    });

    it('/projects/:id/tasks/:task_id (PUT) without inputs', () => {
      return request(app.getHttpServer()).put(`/projects/${testState.project.id}/tasks/${testState.task.id}`)
        .set('X-App-Token', `${appToken}`)
        .set('Origin', 'http://localhost:8080')
        .field('properties', JSON.stringify({
          type: 'annotation',
          assessment: 'ok3',
          status: 'FREE'
        } as TaskProperties))
        .field('transcriptType', 'Text')
        .auth(testState.admin.jwtToken, {type: 'bearer'})
        .expect(200).then(({body}: { body: TaskDto }) => {
          testState.task.id = body.id;
        })
    });

    it('/projects/project_id/:id/tasks/:task_id (GET)', () => {
      return Auth.get(`/projects/${testState.project.id}/tasks/${testState.task.id}`).expect(200);
    });

    it('/projects/project_id/:id/tasks/ (GET)', () => {
      return Auth.get(`/projects/${testState.project.id}/tasks/`).expect(200).then(({body}) => {
        const t = body;
      });
    });

    it('/projects/project_id/annotations/start/ (POST)', () => {
      return Auth.post(`/projects/${testState.project.id}/annotations/start`, undefined).expect(201).then(({body}) => {
        testState.task.id = body.id;
      });
    });

    it('/projects/:project_id/annotations/:task_id/continue/ (POST)', () => {
      return Auth.put(`/projects/${testState.project.id}/annotations/${testState.task.id}/continue`, undefined).expect(200).then(({body}) => {
        testState.task.id = body.id;
      }).catch((a) => {
        const t = a;
      });
    });

    it('/projects/project_id/annotations/save/ (PUT)', () => {
      return Auth.put(`/projects/${testState.project.id}/annotations/${testState.task.id}/save`, {
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
      return Auth.put(`/projects/${testState.project.id}/annotations/${testState.task.id}/resume`, undefined).expect(200).then(({body}) => {
        testState.task.id = body.id;
      }).catch((a) => {
        const t = a;
      });
    });

    it('/projects/project_id/annotations/free/ (POST)', () => {
      return Auth.put(`/projects/${testState.project.id}/annotations/${testState.task.id}/free`, undefined).expect(200).then(({body}) => {
        testState.task.id = body.id;
      }).catch((a) => {
        const t = a;
      });
    });

    it('/:encryptedPath/:fileName (GET)', () => {
      return Auth.get(testState.mediaItem.url.replace(/^.*8080/g, ''), undefined).expect(200);
    });

    it('/projects/project_id/:id/tasks/:task_id (DELETE)', () => {
      return Auth.delete(`/projects/${testState.project.id}/tasks/${testState.task.id}`, undefined).expect(200);
    });

    it('/projects/:id (DELETE)', () => {
      return Auth.delete(`/projects/${testState.project.id}`, {
        cutAllReferences: false,
        removeAllReferences: true,
        removeProjectFiles: true
      } as ProjectRemoveRequestDto).expect(200);
    });

    it('/account/:id (DELETE)', () => {
      return Auth.delete(`/account/${testState.user.id}`, undefined).expect(200);
    });
  });

  describe('Settings', () => {
    it('/settings/general (PUT)', () => {
      return Auth.put('/settings/general', {
        mail_support_address: 'anyemail@email.com',
        data_policy_urls: [
          {
            language: 'de',
            url: 'https://test.de'
          }
        ]
      } as GeneralSettingsDto).expect(200);
    });

    it('/settings/general (GET)', () => {
      return Auth.get('/settings/general').expect(200).then(({body}) => {
        const t = body;
      });
    });
  });
});
