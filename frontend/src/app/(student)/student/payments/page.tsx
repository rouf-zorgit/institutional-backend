import { PaymentUploadForm } from "@/components/payments/PaymentUploadForm";
import { PaymentHistory } from "@/components/payments/PaymentHistory";
import { Separator } from "@/components/ui/separator";

export default function StudentPaymentsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Make a Payment</h2>
                    <PaymentUploadForm />
                </div>
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Payment History</h2>
                    <PaymentHistory />
                </div>
            </div>
        </div>
    );
}
