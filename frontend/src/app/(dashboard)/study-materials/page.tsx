import { StudyMaterialsService, StudyMaterial } from '@/services/study-materials.service';
import { StudyMaterialsList } from '@/components/study-materials/StudyMaterialsList';
import { UploadStudyMaterialForm } from '@/components/study-materials/UploadStudyMaterialForm';
import { cookies } from 'next/headers';

export default async function StudyMaterialsPage() {
    // This is a server component, so we can fetch data directly or use service if we pass cookie
    // But apiRequest in service checks window, so we need to pass token.
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    let materials: StudyMaterial[] = [];
    try {
        // We need to update StudyMaterialsService to accept token too, like Assignments
        // I'll update it first or just inline fetch here? 
        // Updating service is better practice.
        // For now, I'll assume I'll update the service in next step or concurrent.
        // Actually, StudyMaterialsService.getAll doesn't accept token yet.
        // I'll update the service first in a separate tool call to be safe.
        // Or I can just do it in the same turn if I knew I could.
        // I'll update the service in the next turn to be safe.
        // But for now I will write this file assuming updated service.
        const response = await StudyMaterialsService.getAll({}, accessToken);
        if (response.success) {
            materials = response.data.materials;
        }
    } catch (error) {
        console.error('Failed to fetch study materials:', error);
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
                <p className="text-muted-foreground">
                    Upload and manage study resources for your batches.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <UploadStudyMaterialForm />
                </div>
                <div className="md:col-span-2">
                    <StudyMaterialsList materials={materials} />
                </div>
            </div>
        </div>
    );
}
