import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create Super Admin
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@institution.com' },
        update: {},
        create: {
            email: 'admin@institution.com',
            password_hash: hashedPassword,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            profile: { create: { name: 'Super Administrator', phone: '+1234567890' } },
        },
    });
    console.log('✅ Created Super Admin:', superAdmin.email);

    // Create Teachers
    const teachers = [];
    for (let i = 1; i <= 5; i++) {
        const teacher = await prisma.user.upsert({
            where: { email: `teacher${i}@institution.com` },
            update: {},
            create: {
                email: `teacher${i}@institution.com`,
                password_hash: hashedPassword,
                role: 'TEACHER',
                status: 'ACTIVE',
                profile: { create: { name: `Teacher ${i}`, phone: `+123456789${i}` } },
            },
        });
        teachers.push(teacher);
    }
    console.log(`✅ Created ${teachers.length} Teachers`);

    // Create Students
    const students = [];
    for (let i = 1; i <= 50; i++) {
        const student = await prisma.user.upsert({
            where: { email: `student${i}@institution.com` },
            update: {},
            create: {
                email: `student${i}@institution.com`,
                password_hash: hashedPassword,
                role: 'STUDENT',
                status: i <= 40 ? 'ACTIVE' : 'PENDING',
                profile: { create: { name: `Student ${i}`, phone: `+98765432${i.toString().padStart(2, '0')}` } },
            },
        });
        students.push(student);
    }
    console.log(`✅ Created ${students.length} Students`);

    // Create Courses
    const courseData = [
        { title: 'Web Development', description: 'Full-stack development', regular_price: 999.99, offer_price: 799.99, duration: 6, category: 'Technology' },
        { title: 'Data Science', description: 'Data analysis and ML', regular_price: 1299.99, offer_price: 999.99, duration: 8, category: 'Technology' },
        { title: 'Digital Marketing', description: 'Marketing strategies', regular_price: 699.99, offer_price: 549.99, duration: 4, category: 'Marketing' },
    ];

    const courses = [];
    for (const courseInfo of courseData) {
        const course = await prisma.course.create({
            data: { ...courseInfo, status: 'PUBLISHED', created_by: superAdmin.id },
        });
        courses.push(course);
    }
    console.log(`✅ Created ${courses.length} Courses`);

    // Create Batches
    const batches = [];
    for (let i = 0; i < courses.length; i++) {
        const batch = await prisma.batch.create({
            data: {
                course_id: courses[i].id,
                name: `${courses[i].title} - Batch 1`,
                capacity: 30,
                start_date: new Date(2024, 2, 1),
                end_date: new Date(2024, 8, 1),
                class_days: ['Monday', 'Wednesday', 'Friday'],
                class_time: '10:00 AM - 12:00 PM',
                teacher_id: teachers[i % teachers.length].id,
                status: 'ACTIVE',
                created_by: superAdmin.id,
            },
        });
        batches.push(batch);
    }
    console.log(`✅ Created ${batches.length} Batches`);

    // Create Enrollments
    for (let i = 0; i < 30; i++) {
        const batch = batches[i % batches.length];

        // Fetch the course to get the price
        const course = await prisma.course.findUnique({
            where: { id: batch.course_id },
        });

        const enrollment = await prisma.enrollment.create({
            data: {
                student_id: students[i].id,
                batch_id: batch.id,
                status: i < 20 ? 'ACTIVE' : 'PENDING',
                payment_status: i < 20 ? 'APPROVED' : 'PENDING',
                enrolled_at: i < 20 ? new Date() : null,
                created_by: superAdmin.id,
            },
        });

        await prisma.payment.create({
            data: {
                student_id: students[i].id,
                enrollment_id: enrollment.id,
                amount: course?.offer_price || course?.regular_price || 0,
                payment_method: 'BANK_TRANSFER',
                status: i < 20 ? 'APPROVED' : 'PENDING',
                approved_by: i < 20 ? superAdmin.id : null,
                approved_at: i < 20 ? new Date() : null,
            },
        });
    }
    console.log('✅ Created 30 Enrollments with Payments');

    console.log('\n🎉 Database seeded successfully!');
    console.log('📝 Credentials: admin@institution.com / admin123');
    console.log('   Teachers: teacher1-5@institution.com / admin123');
    console.log('   Students: student1-50@institution.com / admin123');
}

main()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
