import { securityPlugin } from './plugin';

describe('security', () => {
  it('should export plugin', () => {
    expect(securityPlugin).toBeDefined();
  });
});
