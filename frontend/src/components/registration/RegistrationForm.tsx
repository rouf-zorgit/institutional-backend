'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { personalDetailsSchema, academicDetailsSchema, documentUploadSchema } from './schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronRight, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const steps = [
    { id: 1, title: 'Personal Details', description: 'Basic information' },
    { id: 2, title: 'Academic Details', description: 'Educational background' },
    { id: 3, title: 'Documents', description: 'Upload necessary files' },
];

export function RegistrationForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({});

    const personalForm = useForm({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: formData.personal || {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
        },
    });

    const academicForm = useForm({
        resolver: zodResolver(academicDetailsSchema),
        defaultValues: formData.academic || {
            previousSchool: '',
            grade: '',
            percentage: '',
            board: '',
            yearOfPassing: '',
        },
    });

    const onPersonalSubmit = (data: any) => {
        setFormData({ ...formData, personal: data });
        setCurrentStep(2);
    };

    const onAcademicSubmit = (data: any) => {
        setFormData({ ...formData, academic: data });
        setCurrentStep(3);
    };

    const onFinalSubmit = () => {
        console.log('Final Submission:', formData);
        // Interact with API here
        alert('Registration submitted successfully!');
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Stepper */}
            <div className="flex justify-between mb-8">
                {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center flex-1">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold mb-2",
                            currentStep === step.id ? "border-primary bg-primary text-primary-foreground" :
                                currentStep > step.id ? "border-green-500 bg-green-500 text-white" : "border-muted-foreground text-muted-foreground"
                        )}>
                            {currentStep > step.id ? <Check className="w-6 h-6" /> : step.id}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">{step.title}</p>
                            <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                        </div>
                        {step.id !== 3 && <div className="hidden sm:block absolute w-full h-0.5 bg-gray-200 -z-10 top-5 left-1/2 transform -translate-x-1/2" />}
                    </div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                    <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {currentStep === 1 && (
                        <Form {...personalForm}>
                            <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={personalForm.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={personalForm.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={personalForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="john@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={personalForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1234567890" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={personalForm.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of birth</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-[240px] pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={personalForm.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={personalForm.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="123 Main St..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit">
                                        Next <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {currentStep === 2 && (
                        <Form {...academicForm}>
                            <form onSubmit={academicForm.handleSubmit(onAcademicSubmit)} className="space-y-4">
                                <FormField
                                    control={academicForm.control}
                                    name="previousSchool"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Previous School / College</FormLabel>
                                            <FormControl>
                                                <Input placeholder="School Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={academicForm.control}
                                        name="board"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Board / University</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="CBSE / State Board" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={academicForm.control}
                                        name="grade"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grade / Class Passed</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="10th / 12th" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={academicForm.control}
                                        name="yearOfPassing"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Year of Passing</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="2023" type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={academicForm.control}
                                        name="percentage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Percentage / GPA</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="85.5" type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                                        Previous
                                    </Button>
                                    <Button type="submit">
                                        Next <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="grid gap-4">
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium">Upload Passport Photo</p>
                                    <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                                </div>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium">Upload ID Proof</p>
                                    <p className="text-xs text-muted-foreground">PDF, JPG up to 5MB</p>
                                </div>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium">Upload Marksheets</p>
                                    <p className="text-xs text-muted-foreground">PDF (Combined) up to 10MB</p>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                                    Previous
                                </Button>
                                <Button onClick={onFinalSubmit} className="bg-green-600 hover:bg-green-700">
                                    Submit Registration
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
