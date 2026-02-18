export enum Permission {
    // User Management
    USER_CREATE = 'user:create',
    USER_READ = 'user:read',
    USER_UPDATE = 'user:update',
    USER_DELETE = 'user:delete',
    USER_LIST = 'user:list',

    // Course Management
    COURSE_CREATE = 'course:create',
    COURSE_READ = 'course:read',
    COURSE_UPDATE = 'course:update',
    COURSE_DELETE = 'course:delete',
    COURSE_LIST = 'course:list',

    // Category Management
    CATEGORY_CREATE = 'category:create',
    CATEGORY_READ = 'category:read',
    CATEGORY_UPDATE = 'category:update',
    CATEGORY_DELETE = 'category:delete',
    CATEGORY_LIST = 'category:list',

    // Batch Management
    BATCH_CREATE = 'batch:create',
    BATCH_READ = 'batch:read',
    BATCH_UPDATE = 'batch:update',
    BATCH_DELETE = 'batch:delete',
    BATCH_LIST = 'batch:list',

    // Enrollment Management
    ENROLLMENT_CREATE = 'enrollment:create',
    ENROLLMENT_READ = 'enrollment:read',
    ENROLLMENT_UPDATE = 'enrollment:update',
    ENROLLMENT_DELETE = 'enrollment:delete',
    ENROLLMENT_LIST = 'enrollment:list',

    // Payment Management
    PAYMENT_CREATE = 'payment:create',
    PAYMENT_READ = 'payment:read',
    PAYMENT_APPROVE = 'payment:approve',
    PAYMENT_REJECT = 'payment:reject',
    PAYMENT_LIST = 'payment:list',

    // Registration Management
    REGISTRATION_ACADEMIC_REVIEW = 'registration:academic_review',
    REGISTRATION_FINANCE_VERIFY = 'registration:finance_verify',
    REGISTRATION_APPROVE = 'registration:approve',
    REGISTRATION_REJECT = 'registration:reject',
    REGISTRATION_READ = 'registration:read',
    REGISTRATION_LIST = 'registration:list',

    // Attendance
    ATTENDANCE_MARK = 'attendance:mark',
    ATTENDANCE_READ = 'attendance:read',
    ATTENDANCE_UPDATE = 'attendance:update',
    ATTENDANCE_LIST = 'attendance:list',

    // Study Materials
    MATERIAL_CREATE = 'material:create',
    MATERIAL_READ = 'material:read',
    MATERIAL_UPDATE = 'material:update',
    MATERIAL_DELETE = 'material:delete',
    MATERIAL_LIST = 'material:list',

    // Assignments
    ASSIGNMENT_CREATE = 'assignment:create',
    ASSIGNMENT_READ = 'assignment:read',
    ASSIGNMENT_UPDATE = 'assignment:update',
    ASSIGNMENT_DELETE = 'assignment:delete',
    ASSIGNMENT_SUBMIT = 'assignment:submit',
    ASSIGNMENT_GRADE = 'assignment:grade',
    ASSIGNMENT_LIST = 'assignment:list',

    // Notifications
    NOTIFICATION_CREATE = 'notification:create',
    NOTIFICATION_READ = 'notification:read',
    NOTIFICATION_DELETE = 'notification:delete',

    // Announcements
    ANNOUNCEMENT_CREATE = 'announcement:create',
    ANNOUNCEMENT_READ = 'announcement:read',
    ANNOUNCEMENT_UPDATE = 'announcement:update',
    ANNOUNCEMENT_DELETE = 'announcement:delete',

    // Reports
    REPORT_FINANCIAL = 'report:financial',
    REPORT_ATTENDANCE = 'report:attendance',
    REPORT_PERFORMANCE = 'report:performance',
    REPORT_ANALYTICS = 'report:analytics',

    // Audit Logs
    AUDIT_READ = 'audit:read',
}

// Role-Permission mapping
export const RolePermissions: Record<string, Permission[]> = {
    SUPER_ADMIN: Object.values(Permission), // All permissions

    ADMIN: [
        // User Management
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.USER_LIST,

        // Course Management
        Permission.COURSE_CREATE,
        Permission.COURSE_READ,
        Permission.COURSE_UPDATE,
        Permission.COURSE_DELETE,
        Permission.COURSE_LIST,

        // Batch Management
        Permission.BATCH_CREATE,
        Permission.BATCH_READ,
        Permission.BATCH_UPDATE,
        Permission.BATCH_DELETE,
        Permission.BATCH_LIST,

        // Enrollment Management
        Permission.ENROLLMENT_CREATE,
        Permission.ENROLLMENT_READ,
        Permission.ENROLLMENT_UPDATE,
        Permission.ENROLLMENT_DELETE,
        Permission.ENROLLMENT_LIST,

        // Payment Management
        Permission.PAYMENT_CREATE,
        Permission.PAYMENT_READ,
        Permission.PAYMENT_APPROVE,
        Permission.PAYMENT_REJECT,
        Permission.PAYMENT_LIST,

        // Registration Management
        Permission.REGISTRATION_ACADEMIC_REVIEW,
        Permission.REGISTRATION_FINANCE_VERIFY,
        Permission.REGISTRATION_APPROVE,
        Permission.REGISTRATION_REJECT,
        Permission.REGISTRATION_READ,
        Permission.REGISTRATION_LIST,

        // Attendance
        Permission.ATTENDANCE_MARK,
        Permission.ATTENDANCE_READ,
        Permission.ATTENDANCE_UPDATE,
        Permission.ATTENDANCE_LIST,

        // Study Materials
        Permission.MATERIAL_CREATE,
        Permission.MATERIAL_READ,
        Permission.MATERIAL_UPDATE,
        Permission.MATERIAL_DELETE,
        Permission.MATERIAL_LIST,

        // Assignments
        Permission.ASSIGNMENT_CREATE,
        Permission.ASSIGNMENT_READ,
        Permission.ASSIGNMENT_UPDATE,
        Permission.ASSIGNMENT_DELETE,
        Permission.ASSIGNMENT_GRADE,
        Permission.ASSIGNMENT_LIST,

        // Notifications & Announcements
        Permission.NOTIFICATION_CREATE,
        Permission.NOTIFICATION_READ,
        Permission.ANNOUNCEMENT_CREATE,
        Permission.ANNOUNCEMENT_READ,
        Permission.ANNOUNCEMENT_UPDATE,
        Permission.ANNOUNCEMENT_DELETE,

        // Reports
        Permission.REPORT_FINANCIAL,
        Permission.REPORT_ATTENDANCE,
        Permission.REPORT_PERFORMANCE,
        Permission.REPORT_ANALYTICS,

        // Audit
        Permission.AUDIT_READ,
    ],

    TEACHER: [
        // Course & Batch (Read only)
        Permission.COURSE_READ,
        Permission.COURSE_LIST,
        Permission.BATCH_READ,
        Permission.BATCH_UPDATE, // Own batches only
        Permission.BATCH_LIST,

        // Enrollment (Read only)
        Permission.ENROLLMENT_READ,
        Permission.ENROLLMENT_LIST,

        // Attendance (Full access for own batches)
        Permission.ATTENDANCE_MARK,
        Permission.ATTENDANCE_READ,
        Permission.ATTENDANCE_UPDATE,
        Permission.ATTENDANCE_LIST,

        // Study Materials (Full access for own batches)
        Permission.MATERIAL_CREATE,
        Permission.MATERIAL_READ,
        Permission.MATERIAL_UPDATE,
        Permission.MATERIAL_DELETE,
        Permission.MATERIAL_LIST,

        // Assignments (Full access for own batches)
        Permission.ASSIGNMENT_CREATE,
        Permission.ASSIGNMENT_READ,
        Permission.ASSIGNMENT_UPDATE,
        Permission.ASSIGNMENT_DELETE,
        Permission.ASSIGNMENT_GRADE,
        Permission.ASSIGNMENT_LIST,

        // Notifications
        Permission.NOTIFICATION_READ,
        Permission.ANNOUNCEMENT_READ,

        // Reports (Limited)
        Permission.REPORT_ATTENDANCE,
        Permission.REPORT_PERFORMANCE,
    ],

    FINANCE: [
        // Payment Management
        Permission.PAYMENT_READ,
        Permission.PAYMENT_LIST,
        Permission.PAYMENT_APPROVE,
        Permission.PAYMENT_REJECT,

        // Registration Management
        Permission.REGISTRATION_READ,
        Permission.REGISTRATION_LIST,
        Permission.REGISTRATION_FINANCE_VERIFY,

        // Notifications & Announcements
        Permission.NOTIFICATION_READ,
        Permission.ANNOUNCEMENT_READ,

        // Reports
        Permission.REPORT_FINANCIAL,
    ],

    STAFF: [
        // Read-only access
        Permission.COURSE_READ,
        Permission.COURSE_LIST,
        Permission.CATEGORY_READ,
        Permission.CATEGORY_LIST,
        Permission.BATCH_READ,
        Permission.BATCH_LIST,
        Permission.ENROLLMENT_READ,
        Permission.ENROLLMENT_LIST,
        Permission.PAYMENT_READ,
        Permission.PAYMENT_LIST,
        Permission.ATTENDANCE_READ,
        Permission.ATTENDANCE_LIST,
        Permission.MATERIAL_READ,
        Permission.MATERIAL_LIST,
        Permission.ASSIGNMENT_READ,
        Permission.ASSIGNMENT_LIST,
        Permission.NOTIFICATION_READ,
        Permission.ANNOUNCEMENT_READ,

        // Registration Review
        Permission.REGISTRATION_READ,
        Permission.REGISTRATION_LIST,
        Permission.REGISTRATION_ACADEMIC_REVIEW,
    ],

    STUDENT: [
        // Course & Batch (Read only)
        Permission.COURSE_READ,
        Permission.COURSE_LIST,
        Permission.BATCH_READ,

        // Own enrollment
        Permission.ENROLLMENT_READ,

        // Own payments
        Permission.PAYMENT_CREATE,
        Permission.PAYMENT_READ,

        // Own attendance
        Permission.ATTENDANCE_READ,

        // Study materials (Read only)
        Permission.MATERIAL_READ,
        Permission.MATERIAL_LIST,

        // Assignments (Submit only)
        Permission.ASSIGNMENT_READ,
        Permission.ASSIGNMENT_SUBMIT,
        Permission.ASSIGNMENT_LIST,

        // Notifications
        Permission.NOTIFICATION_READ,
        Permission.ANNOUNCEMENT_READ,
    ],
};

/**
 * Check if role has permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
    const permissions = RolePermissions[role] || [];
    return permissions.includes(permission);
}

/**
 * Check if role has any of the permissions
 */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
    const rolePermissions = RolePermissions[role] || [];
    return permissions.some((p) => rolePermissions.includes(p));
}

/**
 * Check if role has all of the permissions
 */
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
    const rolePermissions = RolePermissions[role] || [];
    return permissions.every((p) => rolePermissions.includes(p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string): Permission[] {
    return RolePermissions[role] || [];
}
