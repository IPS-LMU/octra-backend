import {TestHandlers} from './test-handlers';

interface TestCase {
  name: string;
  handler: () => void;
}

interface TestCaseGroup {
  name: string;
  cases: TestCase[];
}

export class TestManager {
  public cases: TestCaseGroup[] = [];

  constructor() {
    this.initDefaults();
  }

  public overWriteHandler(name: string, handler: () => void) {
    this.cases = this.cases.map((group) => ({
      ...group,
      cases: group.cases.map((testCase) => {
        if (testCase.name === name) {
          return {
            ...testCase,
            handler
          };
        }
        return testCase;
      })
    }));
  }

  public removeGroup(name: string) {
    const index = this.cases.findIndex(a => a.name === name);
    if (index > -1) {
      this.cases.splice(index, 1);
    }
  }

  public removeTestCase(name: string) {
    this.cases = this.cases.map(group => {
      const index = group.cases.findIndex(a => a.name === name);
      if (index > -1) {
        group.cases.splice(index, 1);
      }
      return group;
    })
  }

  public insertAfter(name: string, testCase: TestCase) {
    this.cases = this.cases.map(group => {
      const index = group.cases.findIndex(a => a.name === name);
      if (index > -1) {
        return {
          ...group,
          cases: [
            ...group.cases.slice(0, index),
            testCase,
            ...group.cases.slice(index)
          ]
        };
      }
      return group;
    });
  }

  private initDefaults() {
    this.cases = [
      {
        name: 'Registration',
        cases: [
          {
            name: 'doNormalAccountRegistration',
            handler: TestHandlers.doNormalAccountRegistration
          }
        ]
      },
      {
        name: 'Authentication',
        cases: [
          {
            name: 'authenticateAdministrator',
            handler: TestHandlers.authenticateAdministrator
          },
          {
            name: 'authenticate',
            handler: TestHandlers.authenticate
          }
        ]
      },
      {
        name: 'Tools',
        cases: [
          {
            name: 'createNewTool',
            handler: TestHandlers.createNewTool
          },
          {
            name: 'removeTool',
            handler: TestHandlers.removeTool
          }
        ]
      },
      {
        name: 'AppTokens',
        cases: [
          {
            name: 'listAppTokens',
            handler: TestHandlers.listAppTokens
          },
          {
            name: 'createNewAppToken',
            handler: TestHandlers.createNewAppToken
          },
          {
            name: 'changeAppToken',
            handler: TestHandlers.changeAppToken
          },
          {
            name: 'refreshAppToken',
            handler: TestHandlers.refreshAppToken
          },
          {
            name: 'removeAppToken',
            handler: TestHandlers.removeAppToken
          }
        ]
      },
      {
        name: 'Account',
        cases: [
          {
            name: 'listAccounts',
            handler: TestHandlers.listAccounts
          },
          {
            name: 'getCurrentAccount',
            handler: TestHandlers.getCurrentAccount
          },
          {
            name: 'changeCurrentAccountPassword',
            handler: TestHandlers.changeCurrentAccountPassword
          },
          {
            name: 'getAccountByHash',
            handler: TestHandlers.getAccountByHash
          },
          {
            name: 'getAccountById',
            handler: TestHandlers.getAccountById
          }
        ]
      },
      {
        name: 'Projects',
        cases: [
          {
            name: 'listProjects',
            handler: TestHandlers.listProjects
          },
          {
            name: 'createNewProject',
            handler: () => TestHandlers.createNewProject()
          },
          {
            name: 'assignProjectRoles',
            handler: TestHandlers.assignProjectRoles
          },
          {
            name: 'assignAccountRoles',
            handler: TestHandlers.assignAccountRoles
          },
          {
            name: 'changeProjectGuidelines',
            handler: TestHandlers.changeProjectGuidelines
          },
          {
            name: 'listGuidelines',
            handler: TestHandlers.listGuidelines
          }
        ]
      },
      {
        name: 'Project Tasks',
        cases: [
          {
            name: 'uploadTaskDataWithTranscriptFileJSON',
            handler: () => TestHandlers.uploadTaskDataWithTranscriptFileJSON()
          },
          {
            name: 'changeTaskDataWithoutInputs',
            handler: () => TestHandlers.changeTaskDataWithoutInputs()
          },
          {
            name: 'uploadTaskData',
            handler: () => TestHandlers.uploadTaskData()
          },
          {
            name: 'uploadTaskDataWithoutTranscript',
            handler: () => TestHandlers.uploadTaskDataWithoutTranscript()
          },
          {
            name: 'uploadTaskDataWithTranscriptFileText',
            handler: () => TestHandlers.uploadTaskDataWithTranscriptFileText()
          },
          {
            name: 'changeTaskDataWithTranscriptAnnotJSON',
            handler: () => TestHandlers.changeTaskDataWithTranscriptAnnotJSON()
          },
          {
            name: 'changeTaskDataWithTranscriptText',
            handler: () => TestHandlers.changeTaskDataWithTranscriptText()
          },
          {
            name: 'changeTaskDataWithoutTranscript',
            handler: () => TestHandlers.changeTaskDataWithoutTranscript()
          },
          {
            name: 'changeTaskDataTranscriptFileJSON',
            handler: () => TestHandlers.changeTaskDataTranscriptFileJSON()
          },
          {
            name: 'changeTaskDataTranscriptFileText',
            handler: () => TestHandlers.changeTaskDataTranscriptFileText()
          },
          {
            name: 'changeTaskDataWithoutInputs',
            handler: () => TestHandlers.changeTaskDataWithoutInputs()
          },
          {
            name: 'getProjectTask',
            handler: () => TestHandlers.getProjectTask()
          },
          {
            name: 'listProjectTasks',
            handler: () => TestHandlers.listProjectTasks()
          }
        ]
      },
      {
        name: 'Project Annotations',
        cases: [
          {
            name: 'startAnnotation',
            handler: () => TestHandlers.startAnnotation()
          },
          {
            name: 'continueAnnotation',
            handler: () => TestHandlers.continueAnnotation()
          },
          {
            name: 'saveAnnotation',
            handler: () => TestHandlers.saveAnnotation()
          },
          {
            name: 'resumeAnnotation',
            handler: () => TestHandlers.resumeAnnotation()
          },
          {
            name: 'freeAnnotation',
            handler: () => TestHandlers.freeAnnotation()
          },
          {
            name: 'checkFile',
            handler: () => TestHandlers.checkFile()
          },
          {
            name: 'removeTask',
            handler: () => TestHandlers.removeTask()
          },
          {
            name: 'removeProject',
            handler: () => TestHandlers.removeProject()
          },
          {
            name: 'removeAccount',
            handler: () => TestHandlers.removeAccount()
          }
        ]
      },
      {
        name: 'Policies',
        cases: [
          {
            name: 'addNewPolicy',
            handler: () => TestHandlers.addNewPolicy()
          },
          {
            name: 'addNewPolicyTranslationFile',
            handler: () => TestHandlers.addNewPolicyTranslationFile()
          },
          {
            name: 'addNewPolicyTranslationText',
            handler: () => TestHandlers.addNewPolicyTranslationText()
          },
          {
            name: 'changePolicyTranslationText',
            handler: () => TestHandlers.changePolicyTranslationText()
          },
          {
            name: 'listPolicies',
            handler: () => TestHandlers.listPolicies()
          },
          {
            name: 'changePolicyPublishdate',
            handler: () => TestHandlers.changePolicyPublishdate()
          },
          {
            name: 'removePolicyTranslation',
            handler: () => TestHandlers.removePolicyTranslation()
          },
          {
            name: 'removePolicy',
            handler: () => TestHandlers.removePolicy()
          }
        ]
      },
      {
        name: 'Settings',
        cases: [
          {
            name: 'changeGeneralSettings',
            handler: () => TestHandlers.changeGeneralSettings()
          },
          {
            name: 'changeGeneralSettings',
            handler: () => TestHandlers.changeGeneralSettings()
          }
        ]
      }
    ];
  }
}
