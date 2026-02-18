"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Registration, RegistrationStatus } from "@/types";
import { Loader2, CheckCircle, XCircle, FileText, DollarSign, GraduationCap } from "lucide-react";
import { format } from "date-fns";

export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const response = await apiRequest<{ data: Registration[] }>("/api/registration");
            // Check if response.data is an array, if not, use empty array
            setRegistrations(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch registrations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'academic-review' | 'financial-verify' | 'final-approve', status: RegistrationStatus) => {
        setProcessingId(id);
        try {
            await apiRequest(`/api/registration/${id}/${action}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            await fetchRegistrations();
        } catch (error) {
            console.error(`Failed to perform ${action}:`, error);
            alert(`Failed to perform action: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Student Registrations</h1>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Student</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Course Details</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Submission Date</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {registrations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                        No pending registrations found.
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg) => (
                                    <tr key={reg.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{reg.student.profile?.name || "N/A"}</span>
                                                <span className="text-xs text-muted-foreground">{reg.student.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span>Course ID: {reg.course_id}</span>
                                                <span className="text-xs text-muted-foreground">Batch Pref: {reg.batch_preference || "Any"}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {format(new Date(reg.created_at), "MMM d, yyyy")}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge status={reg.status} />
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                {reg.status === 'PENDING' && (
                                                    <ActionButton
                                                        onClick={() => handleAction(reg.id, 'academic-review', 'ACADEMIC_REVIEWED')}
                                                        loading={processingId === reg.id}
                                                        icon={<GraduationCap className="h-4 w-4" />}
                                                        label="Academic Review"
                                                        variant="outline"
                                                    />
                                                )}
                                                {reg.status === 'ACADEMIC_REVIEWED' && (
                                                    <ActionButton
                                                        onClick={() => handleAction(reg.id, 'financial-verify', 'FINANCIAL_VERIFIED')}
                                                        loading={processingId === reg.id}
                                                        icon={<DollarSign className="h-4 w-4" />}
                                                        label="Verify Payment"
                                                        variant="outline"
                                                    />
                                                )}
                                                {reg.status === 'FINANCIAL_VERIFIED' && (
                                                    <ActionButton
                                                        onClick={() => handleAction(reg.id, 'final-approve', 'APPROVED')}
                                                        loading={processingId === reg.id}
                                                        icon={<CheckCircle className="h-4 w-4" />}
                                                        label="Approve"
                                                        variant="primary"
                                                    />
                                                )}
                                                {reg.status !== 'APPROVED' && reg.status !== 'REJECTED' && (
                                                    <ActionButton
                                                        onClick={() => {
                                                            const step = reg.status === 'PENDING' ? 'academic-review' :
                                                                reg.status === 'ACADEMIC_REVIEWED' ? 'financial-verify' : 'final-approve';
                                                            handleAction(reg.id, step, 'REJECTED');
                                                        }}
                                                        loading={processingId === reg.id}
                                                        icon={<XCircle className="h-4 w-4" />}
                                                        label="Reject"
                                                        variant="destructive"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Badge({ status }: { status: RegistrationStatus }) {
    const styles = {
        PENDING: "bg-yellow-100/50 text-yellow-700 border-yellow-200",
        ACADEMIC_REVIEWED: "bg-blue-100/50 text-blue-700 border-blue-200",
        FINANCIAL_VERIFIED: "bg-purple-100/50 text-purple-700 border-purple-200",
        APPROVED: "bg-green-100/50 text-green-700 border-green-200",
        REJECTED: "bg-red-100/50 text-red-700 border-red-200",
    };

    const labels = {
        PENDING: "Pending Review",
        ACADEMIC_REVIEWED: "Academic Reviewed",
        FINANCIAL_VERIFIED: "Financial Verified",
        APPROVED: "Approved",
        REJECTED: "Rejected",
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

function ActionButton({ onClick, loading, icon, label, variant = "primary" }: any) {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-sm";
    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    };

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`${baseStyles} ${variants[variant as keyof typeof variants]}`}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <span className="mr-2">{icon}</span>}
            {label}
        </button>
    );
}
