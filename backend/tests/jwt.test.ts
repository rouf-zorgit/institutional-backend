import jwt from 'jsonwebtoken';

describe('JWT Import Test', () => {
    it('should import jwt', () => {
        expect(jwt).toBeDefined();
    });
});
