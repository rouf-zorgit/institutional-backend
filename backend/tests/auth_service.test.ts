import { AuthService } from '../src/modules/auth/auth.service';

describe('Auth Service Import Test', () => {
    it('should import AuthService', () => {
        expect(AuthService).toBeDefined();
    });
});
