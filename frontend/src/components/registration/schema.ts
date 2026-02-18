import * as z from "zod";

export const personalDetailsSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    dateOfBirth: z.date({
        required_error: "Date of birth is required",
    }),
    gender: z.enum(["male", "female", "other"], {
        required_error: "Please select a gender",
    }),
    address: z.string().min(10, "Address must be at least 10 characters"),
});

export const academicDetailsSchema = z.object({
    previousSchool: z.string().min(2, "School name is required"),
    grade: z.string().min(1, "Grade/Class is required"),
    percentage: z.string().min(1, "Percentage/GPA is required"),
    board: z.string().min(2, "Board/University is required"),
    yearOfPassing: z.string().min(4, "Year of passing is required"),
});

export const documentUploadSchema = z.object({
    photo: z.any().optional(), // Logic handled separately
    idProof: z.any().optional(),
    certificates: z.any().optional(),
});

export const registrationSchema = z.object({
    personal: personalDetailsSchema,
    academic: academicDetailsSchema,
    documents: documentUploadSchema,
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
