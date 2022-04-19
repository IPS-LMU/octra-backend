import {Test, TestingModule} from '@nestjs/testing';
import * as request from 'supertest';
import {AppModule} from '../../octra-api-nest/src/app/app.module';
import {AuthDto} from '../../octra-api-nest/src/app/core/authentication/auth.dto';
import {AppTokenCreateDto, AppTokenDto} from '../../octra-api-nest/src/app/core/app-token/app-token.dto';
import {BadRequestException, ValidationPipe} from '@nestjs/common';
import {ValidationError} from 'class-validator';
import {AssignRoleDto, ChangePasswordDto} from '../../octra-api-nest/src/app/core/account/account.dto';
import {UserRole} from '@octra/db';
import {ProjectRequestDto} from '../../octra-api-nest/src/app/core/project/project.dto';

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
let app;

const authGet = (url: string, isAdmin = true) => {
  return request(app.getHttpServer()).get(url).auth(
    isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
    , {type: 'bearer'});
}
const authPost = (url: string, data: any, isAdmin = true) => {
  return request(app.getHttpServer()).post(url).auth(
    isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
    , {type: 'bearer'}).send(data);
}
const authPut = (url: string, data: any, isAdmin = true) => {
  return request(app.getHttpServer()).put(url).auth(
    isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
    , {type: 'bearer'}).send(data);
}
const authDelete = (url: string, isAdmin = true) => {
  return request(app.getHttpServer()).delete(url).auth(
    isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
    , {type: 'bearer'});
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

  describe('Authentication', () => {
    it('/authentication/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login').send({
          'username': 'Julian',
          'password': 'Test1234'
        }).expect(201).then(({body}: { body: AuthDto }) => {
          tempData.admin.jwtToken = body.access_token;
        })
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
      const dto: AppTokenCreateDto = {
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
      const dto: AppTokenCreateDto = {
        description: 'Test description',
        domain: 'fgdfg',
        key: 'sdfgdfgdfgdfgdfgsgf_' + Date.now(),
        name: 'test',
        registrations: true
      };
      return authPut(`/app/tokens/${tempData.apptoken.addedID}`, dto).expect(200);
    });


    it('/app/tokens/:id/refresh (PUT)', () => {
      return authPut(`/app/tokens/${tempData.apptoken.addedID}/refresh`, undefined).expect(200);
    });

    it('/app/tokens/:id (DELETE)', () => {
      return authDelete(`/app/tokens/${tempData.apptoken.addedID}`).expect(200);
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

  it('/account/:id/roles (PUT)', () => {
    return authPut(`/account/444/roles`, {
      general: UserRole.user,
      projects: [
        {
          project_id: 801,
          roles: [
            {
              role: UserRole.dataDelivery
            }
          ]
        },
        {
          project_id: 813,
          roles: [
            {
              role: UserRole.dataDelivery
            }
          ]
        }
      ]
    } as AssignRoleDto, true).expect(200).then(({body}) => {
      if (!Array.isArray(body.projects)) {
        throw new Error('Body must be of type array.');
      }
    })
  });

  it('/account/password (PUT)', () => {
    return authPut('/account/password', {
      oldPassword: 'Test1234',
      newPassword: 'Test1234'
    } as ChangePasswordDto).expect(200);
  });

  it('/account/hash (GET)', () => {
    return request(app.getHttpServer()).get('/account/hash?b07e7c6156b937d17d55362793052f225571764e7f6cf2a15742a534319ee7c6').expect(200);
  });


  it('/account/:id (GET)', () => {
    return authGet(`/account/444`).expect(200).then(({body}) => {
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
      'description': 'arrsseiosdjp askdospasdk oakdsspoakdopaküpd akdspkapsdükapüds'
    } as ProjectRequestDto).expect(201).then(({body}) => {
      if (!body) {
        throw new Error('Body must be of type array.');
      }
      tempData.project.id = body.id;
    }).catch((e) => {
      throw Error(e);
    });
  });

  it('/projects/:id (DELETE)', () => {
    return authDelete(`/projects/${tempData.project.id}`).expect(200);
  });
});
