'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Clock, Library } from "lucide-react";

const studyMaterials = [
    {
        id: "1",
        title: "Introduction to Quantum Mechanics",
        description: "Covers wave-particle duality and Schrödinger equation.",
        type: "PDF",
        batch: "Physics-2024-A",
        uploadedAt: "2024-02-10",
        size: "2.4 MB"
    },
    {
        id: "2",
        title: "Calculus III - Vector Calculus Notes",
        description: "Summary of Green's and Stokes' theorems.",
        type: "PDF",
        batch: "Math-2024-B",
        uploadedAt: "2024-02-12",
        size: "1.1 MB"
    },
    {
        id: "3",
        title: "Lecture Recording - Week 5",
        description: "Video lecture covering Maxwell's equations.",
        type: "VIDEO",
        batch: "Physics-2024-A",
        uploadedAt: "2024-02-14",
        size: "450 MB"
    }
];

export default function StudyMaterialsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1">
                        <Library className="h-4 w-4 mr-2" />
                        All Batches
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {studyMaterials.map((material) => (
                    <Card key={material.id}>
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-lg">{material.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{material.description}</CardDescription>
                            </div>
                            <Badge>{material.type}</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="font-medium text-primary bg-primary/5 px-2 py-0.5 rounded">
                                        {material.batch}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xs font-medium text-muted-foreground">Size: {material.size}</span>
                                    <Button size="sm" variant="outline">
                                        <Download className="h-3 w-3 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
