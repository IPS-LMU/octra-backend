import {AppTokenOriginGuard} from './app-token-origin.guard';

describe('AppTokenOriginGuard', () => {
  it('should be defined', () => {
    expect(new AppTokenOriginGuard()).toBeDefined();
  });
});
