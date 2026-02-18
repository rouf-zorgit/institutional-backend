import authRoutes from '../src/modules/auth/auth.routes';

describe('Auth Route Import Test', () => {
    it('should import authRoutes', () => {
        expect(authRoutes).toBeDefined();
    });
});
