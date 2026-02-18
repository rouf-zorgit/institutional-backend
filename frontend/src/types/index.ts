export interface User {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'FINANCE' | 'STAFF' | 'PARENT';
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    profile?: Profile;
}

export interface Profile {
    id: string;
    userId: string;
    name?: string;
    phone?: string;
    address?: string;
    avatar?: string;
}

export type RegistrationStatus =
    | 'PENDING'
    | 'ACADEMIC_REVIEWED'
    | 'FINANCIAL_VERIFIED'
    | 'APPROVED'
    | 'REJECTED';

export interface Registration {
    id: string;
    student_id: string;
    course_id: string;
    batch_preference?: string;
    status: RegistrationStatus;
    documents: any;
    created_at: string;
    updated_at: string;
    academic_reviewed_by?: string;
    academic_reviewed_at?: string;
    financial_verified_by?: string;
    financial_verified_at?: string;
    approved_by?: string;
    approved_at?: string;
    admin_notes?: string;
    student: User;
    // Add other relations as needed
}
