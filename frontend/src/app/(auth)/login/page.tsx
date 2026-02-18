import { Suspense } from 'react';
import { LoginForm } from "@/components/auth/LoginForm";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
                <p className="text-muted-foreground mt-2">Sign in to your dashboard</p>
            </div>
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
