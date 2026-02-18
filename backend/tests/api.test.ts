import apiRoutes from '../src/api';

describe('API Import Test', () => {
    it('should import apiRoutes', () => {
        expect(apiRoutes).toBeDefined();
    });
});
