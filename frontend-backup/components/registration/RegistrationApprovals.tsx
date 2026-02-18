'use client';

import { useState, useEffect } from 'react';

interface Registration {
    id: string;
    student_id: string;
    course_id: string;
    status: string;
    student: {
        profile: {
            name: string;
            phone: string;
        }
    }
    created_at: string;
}

export function RegistrationApprovals() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRegistrations = async () => {
        try {
            const res = await fetch('/api/v1/registrations');
            const data = await res.json();
            if (data.success) {
                setRegistrations(data.data);
            }
        } catch (err) {
            setError('Failed to fetch registrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const handleAction = async (id: string, step: string, status: string) => {
        const notes = prompt('Enter notes for this action (optional):');
        if (notes === null) return; // User cancelled prompt

        try {
            const res = await fetch(`/api/v1/registrations/${id}/${step}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, admin_notes: notes }),
            });
            if (res.ok) {
                alert('Action successful');
                fetchRegistrations();
            } else {
                const data = await res.json();
                alert(`Error: ${data.message || 'Action failed'}`);
            }
        } catch (err) {
            alert('An unexpected error occurred');
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading registrations...</div>;

    if (error) return (
        <div className="p-8 bg-red-50 text-red-600 border border-red-200 rounded-lg text-center">
            {error}
        </div>
    );

    return (
        <div className="bg-white shadow-xl border border-gray-100 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Pending Approvals</h3>
                <p className="text-sm text-gray-500">Review and approve registrations through the 3-step process.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Information</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Registration Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Step Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {registrations.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No pending registrations found.</td>
                            </tr>
                        ) : registrations.map((reg) => (
                            <tr key={reg.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {reg.student.profile.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900">{reg.student.profile.name}</div>
                                            <div className="text-sm text-gray-500">{reg.student.profile.phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(reg.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${reg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            reg.status === 'ACADEMIC_REVIEWED' ? 'bg-blue-100 text-blue-800' :
                                                reg.status === 'FINANCIAL_VERIFIED' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {reg.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    {reg.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleAction(reg.id, 'academic-review', 'ACADEMIC_REVIEWED')}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                                        >
                                            Verify Academics
                                        </button>
                                    )}
                                    {reg.status === 'ACADEMIC_REVIEWED' && (
                                        <button
                                            onClick={() => handleAction(reg.id, 'financial-verify', 'FINANCIAL_VERIFIED')}
                                            className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                                        >
                                            Verify Finance
                                        </button>
                                    )}
                                    {reg.status === 'FINANCIAL_VERIFIED' && (
                                        <button
                                            onClick={() => handleAction(reg.id, 'final-approve', 'APPROVED')}
                                            className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                                        >
                                            Final Approve
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleAction(reg.id, 'final-approve', 'REJECTED')}
                                        className="text-red-600 hover:text-red-800 font-bold"
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
