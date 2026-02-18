import { prisma } from '../../common/config/database';
import { CreateSubmissionDto, GradeSubmissionDto } from './submissions.validation';

export class SubmissionsService {
    static async create(data: CreateSubmissionDto, studentId: string) {
        return prisma.assignmentSubmission.create({
            data: {
                ...data,
                student_id: studentId
            }
        });
    }

    static async findAll(params: { assignment_id?: string; student_id?: string }) {
        const { assignment_id, student_id } = params;
        return prisma.assignmentSubmission.findMany({
            where: {
                assignment_id,
                student_id
            },
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                assignment: {
                    select: {
                        title: true,
                        total_marks: true
                    }
                }
            },
            orderBy: {
                submitted_at: 'desc'
            }
        });
    }

    static async grade(id: string, data: GradeSubmissionDto, graderId: string) {
        return prisma.assignmentSubmission.update({
            where: { id },
            data: {
                marks: data.marks,
                feedback: data.feedback,
                graded_by: graderId,
                graded_at: new Date()
            }
        });
    }

    static async getById(id: string) {
        return prisma.assignmentSubmission.findUnique({
            where: { id },
            include: {
                student: true,
                assignment: true
            }
        });
    }
}
