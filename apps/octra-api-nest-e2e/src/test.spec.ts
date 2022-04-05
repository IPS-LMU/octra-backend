import {Test, TestingModule} from '@nestjs/testing';
import * as request from 'supertest';
import {AppModule} from '../../octra-api-nest/src/app/app.module';
import {AuthDto} from '../../octra-api-nest/src/app/core/auth/auth.dto';
import {AppTokenCreateDto, AppTokenDto} from '../../octra-api-nest/src/app/core/app-tokens/app-token.dto';
import {BadRequestException, ValidationPipe} from '@nestjs/common';
import {ValidationError} from 'class-validator';

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

const authGet = (url: string, isAdmin = false) => {
  return request(app.getHttpServer()).get(url).auth(
    isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
    , {type: 'bearer'});
}
const authPost = (url: string, data: any, isAdmin = false) => {
  return request(app.getHttpServer()).post(url).auth(
    isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
    , {type: 'bearer'}).send(data);
}
const authPut = (url: string, data: any, isAdmin = false) => {
  return request(app.getHttpServer()).put(url).auth(
    isAdmin ? tempData.admin.jwtToken : tempData.user.jwtToken
    , {type: 'bearer'}).send(data);
}
const authDelete = (url: string, isAdmin = false) => {
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
    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login').send({
          'username': 'john',
          'password': 'changeme'
        }).expect(201).then(({body}: { body: AuthDto }) => {
          tempData.user.jwtToken = body.access_token;
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
