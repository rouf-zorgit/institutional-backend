import { prisma } from '@/common/config/database';
import { MaterialType } from '@prisma/client';

interface CreateStudyMaterialInput {
    batch_id: string;
    title: string;
    description?: string;
    type: MaterialType;
    file_url: string;
}

interface UpdateStudyMaterialInput {
    title?: string;
    description?: string;
    type?: MaterialType;
    file_url?: string;
}

export class StudyMaterialsService {
    static async createStudyMaterial(data: CreateStudyMaterialInput, userId: string) {
        return prisma.studyMaterial.create({
            data: {
                ...data,
                uploaded_by: userId,
            },
        });
    }

    static async findAllStudyMaterials(filters: { batch_id?: string; page?: number; limit?: number }) {
        const { batch_id, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {
            deleted_at: null,
        };

        if (batch_id) {
            where.batch_id = batch_id;
        }

        const [total, materials] = await Promise.all([
            prisma.studyMaterial.count({ where }),
            prisma.studyMaterial.findMany({
                where,
                include: {
                    batch: { select: { id: true, name: true } },
                    uploader: { select: { id: true, email: true, profile: { select: { name: true } } } },
                },
                orderBy: { uploaded_at: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return {
            materials,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async findStudyMaterialById(id: string) {
        return prisma.studyMaterial.findFirst({
            where: { id, deleted_at: null },
            include: {
                batch: true,
                uploader: true,
            },
        });
    }

    static async updateStudyMaterial(id: string, data: UpdateStudyMaterialInput) {
        return prisma.studyMaterial.update({
            where: { id },
            data,
        });
    }

    static async deleteStudyMaterial(id: string) {
        return prisma.studyMaterial.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }
}
