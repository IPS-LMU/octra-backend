import {
  AccountLoginMethod,
  AccountPersonGender,
  AccountRole,
  AssignRoleDto,
  ChangePasswordDto,
  ContentType,
  GuidelinesDto,
  PolicyType,
  ProjectRemoveRequestDto,
  ProjectRequestDto,
  ProjectRoleDto,
  ProjectVisibility,
  TaskDto,
  TaskProperties,
  TranscriptDto
} from '@octra/api-types';
import {PolicyDto, PolicyTranslationDto} from '../../../api/src/app/core/policy/policy.dto';
import {appToken} from './globals';
import * as request from 'supertest';
import {AccountDto, AccountRegisterRequestDto} from '../../../api/src/app/core/account/account.dto';
import {AuthDto} from '../../../api/src/app/core/authentication/auth.dto';
import {ToolCreateRequestDto, ToolDto} from '../../../api/src/app/core/tool/tool.dto';
import {AppTokenDto} from '../../../api/src/app/core/app-token/app-token.dto';
import {AnnotJSONType} from '@octra/server-side';
import {GeneralSettingsDto} from '../../../api/src/app/core/settings/settings.dto';
import * as fs from 'fs';

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

export class TestHandlers {
  private static roleToTest: AccountRole;
  private static app;
  private static testState;

  public static init(roleToTest: AccountRole, app: any) {
    this.roleToTest = roleToTest;
    this.app = app;
    this.testState = TestState;
  }

  public static doNormalAccountRegistration = () => {
    this.testState.user.name = `TestAccount_${Date.now()}`;
    this.testState.user.email = `test_${Date.now()}@email.com`;

    return request(this.app.getHttpServer())
      .post('/account/register').send({
        username: this.testState.user.name,
        password: 'Test123',
        email: this.testState.user.email,
        gender: AccountPersonGender.male,
        first_name: 'Test',
        last_name: 'Person',
        state: 'Bavaria',
        country: 'Germany'
      } as AccountRegisterRequestDto)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .expect(201).then(({body}: { body: AccountDto }) => {
        this.testState.user.id = body.id;
      })
  }

  public static authenticateAdministrator = () => {
    return request(this.app.getHttpServer())
      .post('/auth/login').send({
        'username': 'Julian',
        'password': 'Test123',
        'type': AccountLoginMethod.local
      })
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .expect(201).then(({body}: { body: AuthDto }) => {
        this.testState.admin.jwtToken = body.accessToken;
        this.testState.admin.id = body.account.id;
      })
  }

  public static authenticate = () => {
    return request(this.app.getHttpServer())
      .post('/auth/login').send({
        'username': this.testState.user.name,
        'password': 'Test123',
        'type': AccountLoginMethod.local
      })
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .expect(201).then(({body}: { body: AuthDto }) => {
        this.testState.user.jwtToken = body.accessToken;
        this.testState.user.id = body.account.id;
      })
  }

  public static completeProfile = () => {
    const test = this.post('/account/complete-profile', {
      'language_skills': [{'language': 'German', 'level': 'A2'}],
      'transcription_skills': ['orthographic', 'phonetic']
    }, this.roleToTest);

    return test.expect(201);
  }

  public static createNewTool = () => {
    const test = this.post('/tool', {
      name: `Tool_${Date.now()}`,
      version: '1.0.0',
      description: 'some description'
    } as ToolCreateRequestDto, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(201).then(({body}: { body: ToolDto }) => {
        if (typeof body !== 'object') {
          throw new Error('Body must be of type object.');
        }
      });
    } else {
      return test.expect(403);
    }
  };

  public static removeTool = () => {
    const test = this.delete(`/tool/${this.testState.tool.id}`, undefined, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200);
    }
    return test.expect(403);
  };

  public static listAppTokens = () => {
    const test = this.get('/app/tokens', this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200).then(({body}) => {
        if (!Array.isArray(body)) {
          throw new Error('Body must be of type array.');
        }
      })
    }
    return test.expect(403);
  }

  public static createNewAppToken = () => {
    const dto = {
      description: 'Test description',
      domain: 'fgdfg',
      name: 'test',
      registrations: false
    };

    const test = this.post('/app/tokens', dto, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(201).then(({body}: { body: AppTokenDto }) => {
        this.testState.apptoken.addedID = body.id;
      });
    }
    return test.expect(403);
  };

  public static refreshAppToken = () => {
    const test = this.put(`/app/tokens/${this.testState.apptoken.addedID}/refresh`, undefined, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200);
    }
    return test.expect(403);
  };

  public static changeAppToken = () => {
    const dto = {
      description: 'Test description',
      domain: 'fgdfg',
      registrations: true
    };

    const test = this.put(`/app/tokens/${this.testState.apptoken.addedID}`, dto, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200);
    }
    return test.expect(403);
  };

  public static removeAppToken = () => {
    const test = this.delete(`/app/tokens/${this.testState.apptoken.addedID}`, undefined, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200);
    }
    return test.expect(403);
  };

  public static listAccounts = () => {
    const test = this.get('/account/', this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200).then(({body}) => {
        if (!Array.isArray(body)) {
          throw new Error('Body must be of type array.');
        }
      });
    }
    return test.expect(403);
  };

  public static getCurrentAccount = () => {
    const test = this.get('/account/current', this.roleToTest);

    return test.expect(200).then(({body}) => {
      if (body === undefined) {
        throw new Error('Body must be of type array.');
      }
    });

  };

  public static changeCurrentAccountPassword = () => {
    const test = this.put('/account/password', {
      oldPassword: 'Test123',
      newPassword: 'Test123'
    } as ChangePasswordDto, this.roleToTest);

    return test.expect(200);
  };

  public static getAccountByHash = () => {
    return request(this.app.getHttpServer())
      .get('/account/hash/b07e7c6156b937d17d55362793052f225571764e7f6cf2a15742a534319ee7c6')
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .expect(200);
  };

  public static getAccountById = () => {
    const test = this.get(`/account/${this.testState.admin.id}`, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200).then(({body}) => {
        if (body === undefined) {
          throw new Error('Body must be of type array.');
        }
      });
    }
    return test.expect(403);
  };

  public static listProjects = () => {
    const test = this.get('/projects/', this.roleToTest);

    return test.expect(200).then(({body}) => {
      if (!Array.isArray(body)) {
        throw new Error('Body must be of type array.');
      }
    });
  };

  public static createNewProject = (role?: AccountRole) => {
    role = role ?? this.roleToTest;
    this.testState.project.name = 'TestProject_' + Date.now();

    const test = this.post('/projects/', {
      'name': this.testState.project.name,
      shortname: `${this.testState.project.name}_short`,
      visibility: ProjectVisibility.public,
      'description': 'test description'
    } as ProjectRequestDto, role);

    if (role === AccountRole.administrator || role === AccountRole.projectAdministrator) {
      return test.expect(201).then(({body}) => {
        if (!body) {
          throw new Error('Body must be of type array.');
        }
        this.testState.project.id = body.id;
      }).catch((e) => {
        throw Error(e);
      });
    }
    return test.expect(403);
  };

  public static assignProjectRoles = () => {
    const test = this.post(`/projects/${this.testState.project.id}/roles`, [{
      account_id: this.testState.user.id,
      role: AccountRole.projectAdministrator,
      valid_startdate: new Date().toISOString(),
      valid_enddate: new Date().toISOString()
    }] as ProjectRoleDto[], this.roleToTest);

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect((a) => a.status === 200 || a.status === 201).then((({body}) => {
        const t = body;
      }));
    }
    return test.expect(403);
  };

  public static assignAccountRoles = () => {
    const test = this.put(`/account/${this.testState.user.id}/roles`, {
      general: AccountRole.user,
      projects: [
        {
          project_id: this.testState.project.id,
          role: AccountRole.projectAdministrator
        }
      ]
    } as AssignRoleDto, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200).then(({body}) => {
        if (!Array.isArray(body.projects)) {
          throw new Error('Body must be of type array.');
        }
      });
    }
    return test.expect(403);
  };

  public static changeProjectGuidelines = () => {
    const test = this.put(`/projects/${this.testState.project.id}/guidelines`, [{
      language: 'de',
      json: {
        test: 'ok'
      }
    }] as GuidelinesDto[], this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200);
    }
    return test.expect(403);
  };

  public static listGuidelines = () => {
    const test = this.get(`/projects/${this.testState.project.id}/guidelines`, this.roleToTest);

    return test.expect(200).then(({body}) => {
      if (!Array.isArray(body)) {
        throw new Error(`Body must be of type array.`)
      }
    });
  };

  public static uploadTaskData = () => {
    const test = request(this.app.getHttpServer()).post(`/projects/${this.testState.project.id}/tasks/`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        orgtext: 'asdas',
        files_destination: 'test/../../../test2'
      }))
      .field('content_type', ContentType.AnnotJSON)
      .field('transcript', JSON.stringify({
        sampleRate: 16000,
        levels: [{
          name: 'Test Level local',
          type: AnnotJSONType.SEGMENT,
          items: []
        }]
      }))
      .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'});

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(201).then(({body}: { body: TaskDto }) => {
        this.testState.task.id = body.id;
        this.testState.mediaItem.url = body.inputs[0].url;
      }).catch((e) => {
        throw new Error(e);
      });
    }
    return test.expect(403);
  };

  public static uploadTaskDataWithoutTranscript = () => {
    const test = request(this.app.getHttpServer()).post(`/projects/${this.testState.project.id}/tasks/`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        orgtext: 'asdas',
        files_destination: 'test/../../../test3'
      }))
      .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'});

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(201).then(({body}: { body: TaskDto }) => {
        this.testState.task.id = body.id;
      });
    }
    return test.expect(403);
  };

  public static uploadTaskDataWithTranscriptFileJSON = (role?: AccountRole) => {
    role = role ?? this.roleToTest;
    const test = request(this.app.getHttpServer()).post(`/projects/${this.testState.project.id}/tasks/`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        orgtext: 'asdas'
      }))
      .field('content_type', ContentType.AnnotJSON)
      .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
      .auth(this.getJWT(role), {type: 'bearer'});

    if (role === AccountRole.administrator
      || role === AccountRole.projectAdministrator) {
      return test.expect(201).then(({body}: { body: TaskDto }) => {
        this.testState.task.id = body.id;
        this.testState.mediaItem.uploadURL = body.inputs[0].url;
        const t = '';
      }).catch((e) => {
        throw e;
      });
    }
    return test.expect(403);
  };

  public static uploadTaskDataWithTranscriptFileText = () => {
    const test = request(this.app.getHttpServer()).post(`/projects/${this.testState.project.id}/tasks/`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        orgtext: 'asdas'
      }))
      .field('content_type', ContentType.Text)
      .attach('inputs[]', './data/files/tmp/test.txt', 'test.txt')
      .attach('inputs[]', './testfiles/WebTranscribe.wav', 'WebTranscribe.wav')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'});

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(201).then(({body}: { body: TaskDto }) => {
        this.testState.task.id = body.id;
        this.testState.mediaItem.uploadURL = body.inputs[0].url;
        const t = '';
      });
    }
    return test.expect(403);
  };

  public static changeTaskDataWithTranscriptAnnotJSON = () => {
    const test = request(this.app.getHttpServer()).put(`/projects/${this.testState.project.id}/tasks/${this.testState.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok'
      } as TaskProperties))
      .field('content_type', ContentType.AnnotJSON)
      .field('transcript', JSON.stringify({
        sampleRate: 16000,
        levels: [{
          name: 'Test Level3',
          type: AnnotJSONType.SEGMENT,
          items: []
        }]
      } as TranscriptDto))
      .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'});

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(200).then(({body}: { body: TaskDto }) => {
        this.testState.task.id = body.id;
      });
    }
    return test.expect(403);
  };

  public static changeTaskDataWithTranscriptText = () => {
    const test = request(this.app.getHttpServer()).put(`/projects/${this.testState.project.id}/tasks/${this.testState.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok'
      } as TaskProperties))
      .field('content_type', ContentType.Text)
      .field('transcript', 'this is a test inline transcript')
      .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'});

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(200).then(({body}: { body: TaskDto }) => {
        this.testState.task.id = body.id;
      });
    }
    return test.expect(403);
  };

  public static changeTaskDataWithoutTranscript = () => {
    const test = request(this.app.getHttpServer()).put(`/projects/${this.testState.project.id}/tasks/${this.testState.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok2'
      } as TaskProperties))
      .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'});

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(200).then(({body}: { body: TaskDto }) => {
        this.testState.task.id = body.id;
      })
    }
    return test.expect(403);
  };

  public static changeTaskDataTranscriptFileJSON = () => {
    const test = request(this.app.getHttpServer()).put(`/projects/${this.testState.project.id}/tasks/${this.testState.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok2',
        status: 'FREE'
      } as TaskProperties))
      .field('content_type', ContentType.AnnotJSON)
      .attach('inputs[]', './data/files/tmp/test2.json', 'test2.json')
      .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'});

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(200).then(({body}: { body: TaskDto }) => {
        this.testState.task.id = body.id;
      });
    }
    return test.expect(403);
  };

  public static changeTaskDataTranscriptFileText = () => {
    const test = request(this.app.getHttpServer()).put(`/projects/${this.testState.project.id}/tasks/${this.testState.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok2',
        status: 'BUSY'
      } as TaskProperties))
      .field('content_type', ContentType.Text)
      .attach('inputs[]', './data/files/tmp/test2.txt', 'test2.txt')
      .attach('inputs[]', './testfiles/WebTranscribe2.wav', 'WebTranscribe2.wav')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'});

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(200).then(({body}: { body: TaskDto }) => {
        this.testState.task.id = body.id;
      });
    }
    return test.expect(403);
  };


  public static changeTaskDataWithoutInputs = (role?: AccountRole) => {
    role = role ?? this.roleToTest;
    const test = request(this.app.getHttpServer()).put(`/projects/${this.testState.project.id}/tasks/${this.testState.task.id}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .field('properties', JSON.stringify({
        type: 'annotation',
        assessment: 'ok3',
        status: 'FREE'
      } as TaskProperties))
      .field('content_type', ContentType.Text)
      .auth(this.getJWT(role), {type: 'bearer'});

    if (role === AccountRole.administrator
      || role === AccountRole.projectAdministrator) {
      return test.expect(200).then(({body}: { body: TaskDto }) => {
        this.testState.task.id = body.id;
      });
    }
    return test.expect(403);
  };

  public static getProjectTask = () => {
    const test = this.get(`/projects/${this.testState.project.id}/tasks/${this.testState.task.id}`, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(200);
    } else {
      return test.expect(403);
    }
  }

  public static listProjectTasks = () => {
    const test = this.get(`/projects/${this.testState.project.id}/tasks/`, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(200).then(({body}) => {
        const t = body;
      });
    } else {
      return test.expect(403);
    }
  }

  public static startAnnotation = () => {
    const test = this.post(`/projects/${this.testState.project.id}/annotations/start`, undefined, this.roleToTest);

    return test.expect(201).then(({body}) => {
      this.testState.task.id = body.id;
      this.testState.mediaItem.url = body.inputs[0].url;
    })
  }

  public static continueAnnotation = () => {
    const test = this.put(`/projects/${this.testState.project.id}/annotations/${this.testState.task.id}/continue`, undefined, this.roleToTest);

    return test.expect(200).then(({body}) => {
      this.testState.task.id = body.id;
    });
  }

  public static saveAnnotation = () => {
    const test = this.put(`/projects/${this.testState.project.id}/annotations/${this.testState.task.id}/save`, {
      assessment: 'assessment', code: 'code', comment: 'comment', log: [{
        name: 'tzas',
        value: 'uiahs'
      }], orgtext: 'orgtext',
      content_type: ContentType.AnnotJSON,
      transcript: {
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
    }, this.roleToTest);

    return test.expect(200).then(({body}) => {
      const t = body;
    }).catch((e) => {
      console.log(e);
    });
  }

  public static resumeAnnotation = () => {
    const test = this.put(`/projects/${this.testState.project.id}/annotations/${this.testState.task.id}/resume`, undefined, this.roleToTest);

    return test.expect(200).then(({body}) => {
      this.testState.task.id = body.id;
    });
  }

  public static checkFile = () => {
    const test = this.get(this.testState.mediaItem.url.replace(/^.*8080/g, ''), this.roleToTest);
    return test.expect(200);
  }

  public static freeAnnotation = () => {
    const test = this.put(`/projects/${this.testState.project.id}/annotations/${this.testState.task.id}/free`, undefined, this.roleToTest);

    return test.expect(200).then(({body}) => {
      this.testState.task.id = body.id;
    });
  }

  public static removeTask = () => {
    const test = this.delete(`/projects/${this.testState.project.id}/tasks/${this.testState.task.id}`, undefined, this.roleToTest);
    if (this.roleToTest === AccountRole.administrator
      || this.roleToTest === AccountRole.projectAdministrator) {
      return test.expect(200);
    }
    return test.expect(403);
  }

  public static removeProject = () => {
    const test = this.delete(`/projects/${this.testState.project.id}`, {
      cutAllReferences: false,
      removeAllReferences: true,
      removeProjectFiles: true
    } as ProjectRemoveRequestDto, this.roleToTest);
    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200);
    }
    return test.expect(403);
  }

  public static removeAccount = () => {
    const test = this.delete(`/account/${this.testState.user.id}`, undefined, this.roleToTest);
    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200);
    }
    return test.expect(403);
  }

  public static addNewPolicy = () => {
    const test = this.post(`/policies`, {
      type: PolicyType.privacy,
      publishdate: '2022-07-12T09:31:18.997Z'
    }, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(201).then(({body}: { body: PolicyDto }) => {
        this.testState.policy.id = body.id;
      });
    } else {
      return test.expect(403);
    }
  }

  public static addNewPolicyTranslationFile = () => {
    const test = request(this.app.getHttpServer()).post(`/policies/${this.testState.policy.id}/translations`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'})
      .field('language', 'en-US')
      .attach('inputs[]', './testfiles/test_policy.pdf', 'test2.pdf');

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(201).then(({body}: { body: PolicyTranslationDto }) => {
        const t = '';
      });
    } else {
      return test.expect(403);
    }
  }

  public static addNewPolicyTranslationText = () => {
    const test = request(this.app.getHttpServer()).post(`/policies/${this.testState.policy.id}/translations`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'})
      .field('language', 'de-DE')
      .field('text', '<h1>Datenschutzerklärung</h1><p>Das ist ein Test</p>');

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(201).then(({body}: { body: PolicyTranslationDto }) => {
        this.testState.policy.translationID = body.id;
      });
    } else {
      return test.expect(403);
    }
  }

  public static changePolicyTranslationText = () => {
    const test = request(this.app.getHttpServer()).put(`/policies/${this.testState.policy.id}/translations/${this.testState.policy.translationID}`)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(this.getJWT(this.roleToTest), {type: 'bearer'})
      .field('language', 'de-DE')
      .field('text', '<h1>Datenschutzerklärung</h1><p>Das ist ein Test 2</p>');

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200).then(({body}: { body: PolicyTranslationDto }) => {
        this.testState.policy.translationID = body.id;
      });
    } else {
      return test.expect(403);
    }
  }

  public static listPolicies = () => {
    const test = this.get('/policies', this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200).then(({body}) => {
        if (!Array.isArray(body)) {
          throw new Error('policies is not of type array');
        }
      });
    } else {
      return test.expect(403);
    }
  }

  public static changePolicyPublishdate = () => {
    const test = this.put(`/policies/${this.testState.policy.id}/`, {
      type: PolicyType.privacy,
      publishdate: '2022-07-11T09:31:18.997Z'
    }, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200).then(({body}: { body: PolicyDto }) => {
        this.testState.policy.id = body.id;
      });
    } else {
      return test.expect(403);
    }
  }

  public static removePolicyTranslation = () => {
    const test = this.delete(`/policies/${this.testState.policy.id}/translations/${this.testState.policy.translationID}`, undefined, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200);
    } else {
      return test.expect(403);
    }
  }

  public static removePolicy = () => {
    const test = this.delete(`/policies/${this.testState.policy.id}/`, undefined, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200);
    } else {
      return test.expect(403);
    }
  }

  public static changeGeneralSettings = () => {
    const test = this.put('/settings/general', {
      mail_support_address: 'anyemail@email.com',
      data_policy_urls: [
        {
          language: 'de',
          url: 'https://test.de'
        }
      ]
    } as GeneralSettingsDto, this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200);
    } else {
      return test.expect(403);
    }
  }

  public static getGeneralSettings = () => {
    const test = this.get('/settings/general', this.roleToTest);

    if (this.roleToTest === AccountRole.administrator) {
      return test.expect(200).then(({body}) => {
        const t = body;
      });
    } else {
      return test.expect(403);
    }
  }

  public static get = (url: string, userRole: AccountRole) => {
    return request(this.app.getHttpServer()).get(url)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(
        this.getJWT(userRole)
        , {type: 'bearer'}).send();
  }

  public static post = (url: string, data: any, userRole: AccountRole) => {
    return request(this.app.getHttpServer()).post(url)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(
        this.getJWT(userRole)
        , {type: 'bearer'}).send(data);
  }

  public static put = (url: string, data: any, userRole: AccountRole) => {
    return request(this.app.getHttpServer()).put(url)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(
        this.getJWT(userRole)
        , {type: 'bearer'}).send(data);
  }

  public static delete = (url: string, data: any, userRole: AccountRole) => {
    return request(this.app.getHttpServer()).delete(url)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(
        this.getJWT(userRole)
        , {type: 'bearer'}).send(data);
  }

  private static getJWT(role: AccountRole) {
    switch (role) {
      case AccountRole.administrator:
        return this.testState.admin.jwtToken;
      default :
        return this.testState.user.jwtToken;
    }
  }
}

const TestState = {
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
  policy: {
    id: '0',
    translationID: '0'
  },
  task: {
    id: '0'
  },
  tool: {
    id: '0'
  }
};
