import { jwtDecode } from "jwt-decode";

export interface AuthUser {
    sub: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'TEACHER' | 'STUDENT' | 'PARENT';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    iat: number;
    exp: number;
}

export function getUserFromToken(token: string): AuthUser | null {
    try {
        return jwtDecode<AuthUser>(token);
    } catch (error) {
        return null;
    }
}
