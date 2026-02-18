import { prisma } from '../src/common/config/database';

describe('Database Import Test', () => {
    it('should import prisma', () => {
        expect(prisma).toBeDefined();
    });
});
