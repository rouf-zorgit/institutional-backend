"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Loader2, Search, Filter, Eye, CheckCircle, XCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Payment {
    id: string;
    amount: number;
    transaction_id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIAL';
    screenshot_url: string;
    created_at: string;
    enrollment: {
        batch: {
            name: string;
            course: { title: string };
        };
        student: {
            profile?: { name: string };
            email: string;
        };
    };
    invoice?: {
        pdf_url: string;
        invoice_number: string;
    };
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Action Dialog State
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [actionType, setActionType] = useState<'view' | 'reject'>('view');

    useEffect(() => {
        fetchPayments();
    }, [statusFilter]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const endpoint = statusFilter === "ALL"
                ? "/api/payments"
                : `/api/payments?status=${statusFilter}`;

            const response = await apiRequest<{ payments: Payment[] }>(endpoint);
            setPayments(Array.isArray(response.payments) ? response.payments : []);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm("Are you sure you want to approve this payment?")) return;
        try {
            await apiRequest(`/api/payments/${id}/approve`, { method: "POST" });
            fetchPayments();
            setIsActionDialogOpen(false);
        } catch (error) {
            console.error("Failed to approve payment:", error);
            alert("Failed to approve payment");
        }
    };

    const handleReject = async () => {
        if (!selectedPayment || !rejectReason) return;
        setActionLoading(true);
        try {
            await apiRequest(`/api/payments/${selectedPayment.id}/reject`, {
                method: "POST",
                body: JSON.stringify({ reason: rejectReason })
            });
            fetchPayments();
            setIsActionDialogOpen(false);
            setRejectReason("");
        } catch (error) {
            console.error("Failed to reject payment:", error);
            alert("Failed to reject payment");
        } finally {
            setActionLoading(false);
        }
    };

    const openActionDialog = (payment: Payment, type: 'view' | 'reject' = 'view') => {
        setSelectedPayment(payment);
        setActionType(type);
        setIsActionDialogOpen(true);
    };

    const filteredPayments = payments.filter(payment =>
        payment.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.enrollment.student.profile?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.enrollment.student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    if (loading && payments.length === 0) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search transaction, student..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Transaction ID</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Student</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Course/Batch</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                        No payments found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-mono text-xs">
                                            {payment.transaction_id}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{payment.enrollment.student.profile?.name || "N/A"}</span>
                                                <span className="text-xs text-muted-foreground">{payment.enrollment.student.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span>{payment.enrollment.batch.course.title}</span>
                                                <span className="text-xs text-muted-foreground">{payment.enrollment.batch.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle font-medium">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(payment.amount)}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <StatusBadge status={payment.status} />
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                {payment.status === 'PENDING' && (
                                                    <>
                                                        <Button variant="outline" size="sm" onClick={() => openActionDialog(payment)}>
                                                            <Eye className="mr-2 h-4 w-4" /> Review
                                                        </Button>
                                                    </>
                                                )}
                                                {payment.status === 'APPROVED' && payment.invoice && (
                                                    <Button variant="ghost" size="sm" onClick={() => window.open(getImageUrl(payment.invoice!.pdf_url), '_blank')}>
                                                        <Download className="mr-2 h-4 w-4" /> Invoice
                                                    </Button>
                                                )}
                                                {payment.status === 'REJECTED' && (
                                                    <span className="text-xs text-red-500">Rejected</span>
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

            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'reject' ? 'Reject Payment' : 'Review Payment'}
                        </DialogTitle>
                        <DialogDescription>
                            Transaction ID: {selectedPayment?.transaction_id}
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === 'view' && selectedPayment && (
                        <div className="space-y-4">
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                {selectedPayment.screenshot_url ? (
                                    <img
                                        src={getImageUrl(selectedPayment.screenshot_url)}
                                        alt="Payment Screenshot"
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        No screenshot available
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between gap-4">
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => setActionType('reject')}
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(selectedPayment.id)}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </Button>
                            </div>
                        </div>
                    )}

                    {actionType === 'reject' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rejection Reason</label>
                                <Textarea
                                    placeholder="Please provide a reason for rejection..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setActionType('view')}>Back</Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleReject}
                                    disabled={!rejectReason || actionLoading}
                                >
                                    {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm Rejection
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        APPROVED: "bg-green-100/50 text-green-700 border-green-200",
        PENDING: "bg-yellow-100/50 text-yellow-700 border-yellow-200",
        REJECTED: "bg-red-100/50 text-red-700 border-red-200",
        PARTIAL: "bg-blue-100/50 text-blue-700 border-blue-200",
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
            {status}
        </span>
    );
}
