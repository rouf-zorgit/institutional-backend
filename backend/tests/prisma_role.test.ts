import { Role } from '@prisma/client';

describe('Prisma Role Import Test', () => {
    it('should import Role enum', () => {
        expect(Role).toBeDefined();
        console.log('Roles:', Object.keys(Role));
    });
});
