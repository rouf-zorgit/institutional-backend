import { prisma } from '@/common/config/database';
// DTOs are defined locally or can be moved to a separate file later

// Define DTO interfaces locally if not in a separate file for now to keep it self-contained in this step
interface CreateAssignmentInput {
    batch_id: string;
    title: string;
    description: string;
    deadline: string;
    total_marks: number;
    file_url?: string;
}

interface UpdateAssignmentInput {
    title?: string;
    description?: string;
    deadline?: string;
    total_marks?: number;
    file_url?: string;
}

interface SubmitAssignmentInput {
    file_url: string;
}

interface GradeAssignmentInput {
    marks: number;
    feedback?: string;
}

export class AssignmentsService {
    static async createAssignment(data: CreateAssignmentInput, userId: string) {
        return prisma.assignment.create({
            data: {
                ...data,
                created_by: userId,
                deadline: new Date(data.deadline),
            },
        });
    }

    static async findAllAssignments(filters: { batch_id?: string; teacher_id?: string; page?: number; limit?: number }) {
        const { batch_id, teacher_id, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {
            deleted_at: null,
        };

        if (batch_id) {
            where.batch_id = batch_id;
        }

        if (teacher_id) {
            // If filtering by teacher, we look for assignments created by this teacher
            // OR assignments in batches taught by this teacher. 
            // Simplest is 'created_by' for now, or join with Batch.
            where.created_by = teacher_id;
        }

        const [total, assignments] = await Promise.all([
            prisma.assignment.count({ where }),
            prisma.assignment.findMany({
                where,
                include: {
                    batch: { select: { id: true, name: true } },
                    creator: { select: { id: true, email: true, role: true } },
                    _count: { select: { submissions: true } }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return {
            assignments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async findAssignmentById(id: string) {
        return prisma.assignment.findFirst({
            where: { id, deleted_at: null },
            include: {
                batch: true,
                submissions: {
                    include: {
                        student: {
                            select: { id: true, email: true, profile: { select: { name: true } } }
                        }
                    }
                }
            }
        });
    }

    static async updateAssignment(id: string, data: UpdateAssignmentInput) {
        return prisma.assignment.update({
            where: { id },
            data: {
                ...data,
                deadline: data.deadline ? new Date(data.deadline) : undefined,
            },
        });
    }

    static async deleteAssignment(id: string) {
        return prisma.assignment.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }

    static async submitAssignment(assignmentId: string, studentId: string, data: SubmitAssignmentInput) {
        // Check if already submitted? Upsert allows re-submission or update.
        // For now, let's assume one active submission per student per assignment.
        return prisma.assignmentSubmission.upsert({
            where: {
                assignment_id_student_id: {
                    assignment_id: assignmentId,
                    student_id: studentId,
                },
            },
            update: {
                file_url: data.file_url,
                submitted_at: new Date(),
            },
            create: {
                assignment_id: assignmentId,
                student_id: studentId,
                file_url: data.file_url,
            },
        });
    }

    static async gradeSubmission(submissionId: string, graderId: string, data: GradeAssignmentInput) {
        return prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                marks: data.marks,
                feedback: data.feedback,
                graded_by: graderId,
                graded_at: new Date(),
            },
        });
    }
}
