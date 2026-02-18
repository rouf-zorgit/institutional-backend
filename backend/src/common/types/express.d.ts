// Express type extensions
import { Request } from 'express';

export interface AuthUser {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STAFF' | 'STUDENT';
    status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export { };
