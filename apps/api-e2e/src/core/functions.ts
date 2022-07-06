import * as fs from 'fs';
import {AnnotJSONType} from '@octra/server-side';
import * as request from 'supertest';
import {appToken, testState} from './globals';

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

export class Auth {
  private static app;

  public static init(app) {
    this.app = app;
  }

  public static get = (url: string, isAdmin = true) => {
    return request(this.app.getHttpServer()).get(url)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(
        isAdmin ? testState.admin.jwtToken : testState.user.jwtToken
        , {type: 'bearer'}).send();
  }

  public static post = (url: string, data: any, isAdmin = true) => {
    return request(this.app.getHttpServer()).post(url)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(
        isAdmin ? testState.admin.jwtToken : testState.user.jwtToken
        , {type: 'bearer'}).send(data);
  }

  public static put = (url: string, data: any, isAdmin = true) => {
    return request(this.app.getHttpServer()).put(url)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(
        isAdmin ? testState.admin.jwtToken : testState.user.jwtToken
        , {type: 'bearer'}).send(data);
  }
  public static delete = (url: string, data: any, isAdmin = true) => {
    return request(this.app.getHttpServer()).delete(url)
      .set('X-App-Token', `${appToken}`)
      .set('Origin', 'http://localhost:8080')
      .auth(
        isAdmin ? testState.admin.jwtToken : testState.user.jwtToken
        , {type: 'bearer'}).send(data);
  }
}
