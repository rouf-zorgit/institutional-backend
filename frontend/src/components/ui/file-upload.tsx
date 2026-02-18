'use client';

import { useState } from 'react';
import { UploadService } from '@/services/upload.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2 } from 'lucide-react';

interface FileUploadProps {
    value?: string;
    onChange: (url: string) => void;
    category: 'assignments' | 'study-materials';
    label?: string;
}

export function FileUpload({ value, onChange, category, label = "Upload File" }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const url = await UploadService.uploadFile(file, category);
            onChange(url);
        } catch (err) {
            setError('Failed to upload file');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    if (value) {
        return (
            <div className="flex items-center gap-2 p-2 border rounded-md">
                <div className="flex-1 truncate text-sm text-muted-foreground">
                    <a href={value} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {value.split('/').pop()}
                    </a>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onChange('')}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="relative"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            {label}
                        </>
                    )}
                    <Input
                        type="file"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                </Button>
                {error && <span className="text-sm text-destructive">{error}</span>}
            </div>
        </div>
    );
}
