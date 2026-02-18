import { RegistrationApprovals } from '@/components/registration/RegistrationApprovals';

export default function RegistrationsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Student Registrations</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Review and manage the 3-step approval process for new student applications.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <RegistrationApprovals />
            </div>
        </div>
    );
}
