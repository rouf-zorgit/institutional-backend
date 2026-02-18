console.log('DEBUG: minimal.test.ts started');
import request from 'supertest';
import app from '../src/app';

describe('Minimal App Test', () => {
    it('should respond to health check', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('healthy');
    });

    it('should respond to API health check', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
