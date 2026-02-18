import { clearDatabase } from './setup';

describe('Setup Import Test', () => {
    it('should import clearDatabase', () => {
        expect(clearDatabase).toBeDefined();
    });
});
