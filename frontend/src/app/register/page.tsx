import { RegistrationForm } from "@/components/registration/RegistrationForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative">
            <Link href="/" className="absolute top-8 left-8">
                <Button variant="ghost" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Home
                </Button>
            </Link>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-foreground">Student Registration</h1>
                <p className="mt-2 text-muted-foreground">Apply for our courses today.</p>
            </div>

            <RegistrationForm />
        </div>
    );
}
