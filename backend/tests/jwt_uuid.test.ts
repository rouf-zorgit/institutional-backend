import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

describe('JWT and UUID Import Test', () => {
    it('should import jwt and uuid', () => {
        expect(jwt).toBeDefined();
        expect(uuidv4).toBeDefined();

        const token = jwt.sign({ test: true }, 'secret');
        expect(token).toBeDefined();

        const id = uuidv4();
        expect(id).toBeDefined();
    });
});
