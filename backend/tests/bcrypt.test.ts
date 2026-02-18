import bcrypt from 'bcrypt';

describe('Bcrypt Test', () => {
    it('should hash password', async () => {
        const password = 'Password123!';
        const hash = await bcrypt.hash(password, 10);
        expect(hash).toBeDefined();
        const isMatch = await bcrypt.compare(password, hash);
        expect(isMatch).toBe(true);
    });
});
