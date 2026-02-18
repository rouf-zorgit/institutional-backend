import { Ratelimit } from '@upstash/ratelimit';

describe('Ratelimit Import Test', () => {
    it('should import Ratelimit', () => {
        expect(Ratelimit).toBeDefined();
    });
});
