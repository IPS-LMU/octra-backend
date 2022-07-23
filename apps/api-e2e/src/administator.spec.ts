import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from '../../api/src/app/app.module';
import {BadRequestException, ValidationPipe} from '@nestjs/common';
import {ValidationError} from 'class-validator';
import {AccountRole} from '@octra/api-types';
import {TestCases} from './core/test-cases';

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
    TestCases.init(AccountRole.administrator, app);
  });

  describe('Registration', () => {
    it('/account/register (POST)', TestCases.doNormalAccountRegistration);
  })

  describe('Authentication', () => {
    it('/auth/login (POST)', TestCases.authenticateAdministrator);
  });

  describe('Tools', () => {
    it('/tool/ (POST)', TestCases.createNewTool);
    it('/tool/ (DELETE)', TestCases.removeTool);
  });

  describe('AppTokens', () => {
    it('/app/tokens (GET)', TestCases.listAppTokens);
    it('/app/tokens (POST)', TestCases.createNewAppToken);
    it('/app/tokens/:id (PUT)', TestCases.changeAppToken);
    it('/app/tokens/:id/refresh (PUT)', TestCases.refreshAppToken);
    it('/app/tokens/:id (DELETE)', TestCases.removeAppToken);
  });

  describe('Accounts', () => {
    it('/account/ (GET)', TestCases.listAccounts);
    it('/account/current (GET)', TestCases.getCurrentAccount);
    it('/account/password (PUT)', TestCases.changeCurrentAccountPassword);
    it('/account/hash (GET)', TestCases.getAccountByHash);
    it('/account/:id (GET)', TestCases.getAccountById);
  });

  describe('Projects', () => {
    it('/projects/ (GET)', TestCases.listProjects);
    it('/projects/ (POST)', () => TestCases.createNewProject());
    it('/projects/:project_id/roles (POST)', TestCases.assignProjectRoles);
    it('/account/:project_id/roles (PUT)', TestCases.assignAccountRoles);
    it('/projects/:project_id/guidelines (PUT)', TestCases.changeProjectGuidelines);
    it('/projects/:project_id/guidelines (GET)', TestCases.listGuidelines);

    it('/projects/:project_id/tasks (POST) (transcript file, JSON)', () => TestCases.uploadTaskDataWithTranscriptFileJSON());
    it('/projects/:project_id/tasks (POST)', TestCases.uploadTaskData);
    it('/projects/:project_id/tasks (POST) (no transcript)', TestCases.uploadTaskDataWithoutTranscript);
    it('/projects/:project_id/tasks (POST) (transcript file, Text)', TestCases.uploadTaskDataWithTranscriptFileText);
    it('/projects/:project_id/tasks/:task_id (PUT) transcript AnnotJSON', TestCases.changeTaskDataWithTranscriptAnnotJSON);
    it('/projects/:project_id/tasks/:task_id (PUT) transcript Text', TestCases.changeTaskDataWithTranscriptText);
    it('/projects/:project_id/tasks/:task_id (PUT) no transcript', TestCases.changeTaskDataWithoutTranscript);
    it('/projects/:project_id/tasks/:task_id (PUT) transcript file JSON', TestCases.changeTaskDataTranscriptFileJSON);
    it('/projects/:project_id/tasks/:task_id (PUT) transcript file Text', TestCases.changeTaskDataTranscriptFileText);
    it('/projects/:project_id/tasks/:task_id (PUT) without inputs', () => TestCases.changeTaskDataWithoutInputs());

    it('/projects/:project_id/:id/tasks/:task_id (GET)', TestCases.getProjectTask);
    it('/projects/:project_id/:id/tasks/ (GET)', TestCases.listProjectTasks);

    it('/projects/project_id/annotations/start/ (POST)', TestCases.startAnnotation);
    it('/projects/:project_id/annotations/:task_id/continue/ (POST)', TestCases.continueAnnotation);
    it('/projects/project_id/annotations/save/ (PUT)', TestCases.saveAnnotation);
    it('/projects/:project_id/annotations/:task_id/resume/ (POST)', TestCases.resumeAnnotation);
    it('/projects/project_id/annotations/free/ (POST)', TestCases.freeAnnotation);

    it('/files/:encryptedPath/:fileName (GET)', TestCases.checkFile);

    it('/projects/project_id/:id/tasks/:task_id (DELETE)', TestCases.removeTask);
    it('/projects/:id (DELETE)', TestCases.removeProject);
    it('/account/:id (DELETE)', TestCases.removeAccount);
  });

  describe('Policies', () => {
    it('/policies (POST) add new file', TestCases.addNewPolicy);
    it('/policies/:id/translations (POST) add a new translation file', TestCases.addNewPolicyTranslationFile);
    it('/policies/:id/translations (POST) add a text translation', TestCases.addNewPolicyTranslationText);
    it('/policies/:id/ (PUT) updates a text translation', TestCases.changePolicyTranslationText);

    it('/policies (GET)', TestCases.listPolicies);
    it('/policies/:id (PUT) updates publishdate', TestCases.changePolicyPublishdate);
    it('/policies (DELETE) one policy translation', TestCases.removePolicyTranslation);

    it('/policies (DELETE) policy', TestCases.removePolicy);
  });

  describe('Settings', () => {
    it('/settings/general (PUT)', TestCases.changeGeneralSettings);
    it('/settings/general (GET)', TestCases.getGeneralSettings);
  });
});
