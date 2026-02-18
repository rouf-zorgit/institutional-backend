import { logger } from '@/common/utils/logger.service';

describe('Path Resolution Test', () => {
    it('should import logger using @/ prefix', () => {
        expect(logger).toBeDefined();
        expect(typeof logger.info).toBe('function');
    });
});
