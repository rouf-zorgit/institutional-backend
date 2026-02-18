'use client';

import { StudyMaterial } from '@/services/study-materials.service';
import { format } from 'date-fns';
import { FileText, Video, StickyNote, File, Download, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudyMaterialsListProps {
    materials: StudyMaterial[];
}

const getIcon = (type: string) => {
    switch (type) {
        case 'PDF': return <FileText className="h-5 w-5 text-red-500" />;
        case 'VIDEO': return <Video className="h-5 w-5 text-blue-500" />;
        case 'NOTE': return <StickyNote className="h-5 w-5 text-yellow-500" />;
        default: return <File className="h-5 w-5 text-gray-500" />;
    }
};

export function StudyMaterialsList({ materials }: StudyMaterialsListProps) {
    if (materials.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No study materials uploaded yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-4 bg-card flex flex-col gap-2 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            {getIcon(material.type)}
                            <h4 className="font-semibold line-clamp-1" title={material.title}>{material.title}</h4>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {material.batch?.name}
                        </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                        {material.description || 'No description'}
                    </p>

                    <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground border-t">
                        <span>{format(new Date(material.uploaded_at), 'MMM d, yyyy')}</span>
                        <a
                            href={material.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                        >
                            <Download className="h-3 w-3" /> Download
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
