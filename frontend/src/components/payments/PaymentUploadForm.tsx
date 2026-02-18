'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for cn

export function PaymentUploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [transactionId, setTransactionId] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle submission logic here
        console.log({ file, amount, paymentType, transactionId });
        alert('Payment proof uploaded successfully!');
        // Reset form
        setFile(null);
        setAmount('');
        setPaymentType('');
        setTransactionId('');
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Upload Payment Proof</CardTitle>
                <CardDescription>Submit your transaction details and receipt for verification.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Payment Type</Label>
                            <Select value={paymentType} onValueChange={setPaymentType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tuition">Tuition Fee</SelectItem>
                                    <SelectItem value="admission">Admission Fee</SelectItem>
                                    <SelectItem value="exam">Exam Fee</SelectItem>
                                    <SelectItem value="transport">Transport Fee</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID / Reference No.</Label>
                        <Input
                            id="transactionId"
                            placeholder="e.g. TXN123456789"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Receipt Upload</Label>
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                                file ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                            )}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => !file && document.getElementById('file-upload')?.click()}
                        >
                            <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                            />

                            {file ? (
                                <div className="flex items-center gap-4 w-full">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PDF, JPG or PNG (max. 5MB)</p>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSubmit} disabled={!file || !amount || !transactionId || !paymentType}>
                    Submit Proof
                </Button>
            </CardFooter>
        </Card>
    );
}
