import { AuthController } from '../src/modules/auth/auth.controller';

describe('Auth Controller Import Test', () => {
    it('should import AuthController', () => {
        expect(AuthController).toBeDefined();
    });
});
