import { v4 as uuidv4 } from 'uuid';

describe('UUID Import Test', () => {
    it('should import uuid', () => {
        expect(uuidv4).toBeDefined();
    });
});
