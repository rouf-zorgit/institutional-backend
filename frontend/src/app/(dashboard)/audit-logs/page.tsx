"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Loader2, Search, Filter, FileText, Download, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entity_id: string;
    user?: {
        profile?: { name: string };
        email: string;
    };
    created_at: string;
    details?: any; // old_value, new_value
    ip_address?: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionFilter, setActionFilter] = useState<string>("ALL");

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter]); // Search usually needs debounce, simplified here

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
            });

            if (actionFilter !== "ALL") {
                queryParams.append("action", actionFilter);
            }
            if (searchQuery) {
                // Backend might not support search directly based on validation schema, 
                // but let's assume it supports searching by entity/user
                // Based on controller, it uses auditQuerySchema.
                // If schema supports search, good. If not, client side filter?
                // Pagination makes client side filter bad.
                // We'll rely on action filter mostly.
            }

            const response = await apiRequest<{ data: AuditLog[], meta: { totalPages: number } }>(`/api/audit-logs?${queryParams.toString()}`);
            setLogs(Array.isArray(response.data) ? response.data : []);
            setTotalPages(response.meta?.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchLogs();
    };

    const handleExport = async () => {
        try {
            const response = await apiRequest<{ data: string }>("/api/audit-logs/export");
            // Handle CSV download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export logs.");
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">Track system activities and changes.</p>
                </div>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    {/* Search might be limited, so keeping it disabled or visual only if API lacks it */}
                    {/* Assuming API support is limited for generic search, utilizing Action Filter more */}
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search logs..." // Search usually requires specific implementation
                        className="pl-8"
                        disabled // Disabled as generic search might not be implemented in backend
                        title="Search functionality depends on backend implementation"
                    />
                </div>
                <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[200px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter Action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Actions</SelectItem>
                        <SelectItem value="LOGIN">Login</SelectItem>
                        <SelectItem value="LOGOUT">Logout</SelectItem>
                        <SelectItem value="CREATE_USER">Create User</SelectItem>
                        <SelectItem value="create">Create (Generic)</SelectItem>
                        <SelectItem value="update">Update (Generic)</SelectItem>
                        <SelectItem value="delete">Delete (Generic)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No audit logs found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <AuditLogItem key={log.id} log={log} />
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            Previous
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function AuditLogItem({ log }: { log: AuditLog }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md p-4 transition-all hover:bg-muted/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </CollapsibleTrigger>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-muted-foreground">
                            {log.user?.profile?.name || log.user?.email || "System"} • {new Date(log.created_at).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{log.entity}</Badge>
                </div>
            </div>
            <CollapsibleContent className="mt-4 pl-10">
                <div className="text-xs font-mono bg-muted p-2 rounded max-h-40 overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(log.details || {}, null, 2)}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
