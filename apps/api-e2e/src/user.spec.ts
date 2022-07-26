import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from '../../api/src/app/app.module';
import {BadRequestException, ValidationPipe} from '@nestjs/common';
import {ValidationError} from 'class-validator';
import {AccountRole} from '@octra/api-types';
import {TestHandlers} from './core/test-handlers';
import {TestManager} from './core/test-cases';

let app;
jest.setTimeout(10000);

describe('OCTRA Nest API user (e2e)', () => {
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
    TestHandlers.init(AccountRole.user, app);
  });

  const testManager = new TestManager();
  testManager.overWriteHandler('createNewProject', () => TestHandlers.createNewProject(AccountRole.administrator));
  testManager.overWriteHandler('uploadTaskDataWithTranscriptFileJSON', () => TestHandlers.uploadTaskDataWithTranscriptFileJSON(AccountRole.administrator));
  testManager.overWriteHandler('changeTaskDataWithoutInputs', () => TestHandlers.changeTaskDataWithoutInputs(AccountRole.administrator));

  testManager.cases.forEach((group) => {
    describe(group.name, () => {
      group.cases.forEach((testCase) => {
        it(testCase.name, testCase.handler);
      });
    });
  });
});
