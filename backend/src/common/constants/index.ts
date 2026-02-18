export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    STAFF: 'STAFF',
    STUDENT: 'STUDENT',
} as const;

export const USER_STATUS = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    INACTIVE: 'INACTIVE',
} as const;

export const COURSE_STATUS = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
} as const;

export const BATCH_STATUS = {
    UPCOMING: 'UPCOMING',
    ONGOING: 'ONGOING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

export const ENROLLMENT_STATUS = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PARTIAL: 'PARTIAL',
} as const;

export const REGISTRATION_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const;

export const ATTENDANCE_STATUS = {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    LATE: 'LATE',
} as const;

export const MATERIAL_TYPE = {
    PDF: 'PDF',
    VIDEO: 'VIDEO',
    NOTE: 'NOTE',
    ASSIGNMENT: 'ASSIGNMENT',
} as const;

export const NOTIFICATION_TYPE = {
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
} as const;

export const EMAIL_TYPE = {
    REGISTRATION_APPROVED: 'REGISTRATION_APPROVED',
    REGISTRATION_REJECTED: 'REGISTRATION_REJECTED',
    PAYMENT_APPROVED: 'PAYMENT_APPROVED',
    PAYMENT_REJECTED: 'PAYMENT_REJECTED',
    ASSIGNMENT_DEADLINE: 'ASSIGNMENT_DEADLINE',
    LOW_ATTENDANCE: 'LOW_ATTENDANCE',
} as const;

export const EMAIL_STATUS = {
    PENDING: 'PENDING',
    SENT: 'SENT',
    FAILED: 'FAILED',
} as const;

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

// File upload limits
export const FILE_UPLOAD = {
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
    ALLOWED_ALL_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
} as const;
