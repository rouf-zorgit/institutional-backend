import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-16 flex items-center border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <GraduationCap className="h-6 w-6" />
          <span>Institute Manager</span>
        </div>
        <div className="ml-auto flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <section className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight lg:text-7xl">
            Manage Your Institution <br className="hidden sm:inline" />
            <span className="text-primary">With Ease</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive management system for students, courses, batches, and more. Streamline your operations today.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-lg">
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                Admin Portal
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full text-left">
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Create and organize courses efficiently.</CardDescription>
            </CardHeader>
            <CardContent>
              Track curriculum, assign teachers, and manage content delivery.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment</CardTitle>
              <CardDescription>Simplified registration process.</CardDescription>
            </CardHeader>
            <CardContent>
              Handle applications, verify documents, and manage student records.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Financial Tracking</CardTitle>
              <CardDescription>Monitor payments and invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              Automated invoicing, payment tracking, and financial reporting.
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © 2024 Institute Manager. All rights reserved.
      </footer>
    </div>
  );
}
