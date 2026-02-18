import { RegistrationForm } from "@/components/registration/RegistrationForm";

export default function StudentRegistrationPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">New Student Registration</h1>
            <RegistrationForm />
        </div>
    );
}
