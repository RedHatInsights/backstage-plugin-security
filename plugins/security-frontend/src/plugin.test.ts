import { securityPlugin } from './plugin';

describe('security-frontend', () => {
  it('should export plugin', () => {
    expect(securityPlugin).toBeDefined();
  });
});
