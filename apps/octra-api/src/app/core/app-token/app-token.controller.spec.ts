import {Test, TestingModule} from '@nestjs/testing';
import {AppTokenController} from './app-token.controller';

describe('TokensController', () => {
  let controller: AppTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppTokenController],
    }).compile();

    controller = module.get<AppTokenController>(AppTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
