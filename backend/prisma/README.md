# Prisma Schema Documentation

See the comprehensive documentation on high-concurrency features:
- [High Concurrency Features](../../../antigravity/brain/88884a70-c2a2-4ead-ad02-71a8f6040fc6/prisma_schema_concurrency.md)

## Schema Overview

This schema is optimized for 20,000+ concurrent users with:

✅ **UUIDs** for all primary keys (horizontal scaling)
✅ **Composite indexes** on frequently queried fields
✅ **Unique constraints** to prevent race conditions
✅ **Soft deletes** on all primary entities
✅ **Timestamps** on all tables
✅ **Optimized data types** (Decimal for money, Text for long content)

## Tables

### Users & Authentication
- `users` - User accounts with role-based access
- `user_profiles` - Extended user information
- `sessions` - JWT refresh token storage
- `audit_logs` - System-wide action tracking

### Academic Structure
- `courses` - Course catalog
- `batches` - Course batches with scheduling
- `enrollments` - Student-batch relationships

### Student Lifecycle
- `student_registrations` - Registration requests
- `payments` - Payment records with approval workflow
- `invoices` - Generated invoices

### Academic Operations
- `attendance` - Attendance tracking
- `study_materials` - Learning resources
- `assignments` - Assignment management
- `assignment_submissions` - Student submissions

### Communication
- `notifications` - In-app notifications
- `announcements` - System announcements
- `email_logs` - Email tracking

## Key Features

### Composite Indexes
```prisma
// Attendance - prevents duplicates, enables fast queries
@@unique([student_id, batch_id, date])
@@index([batch_id, date])

// Enrollment - prevents duplicate enrollments
@@unique([student_id, batch_id])
@@index([batch_id, status])

// Payment - fast status queries
@@index([student_id, status])
@@index([status])
```

### Race Condition Prevention
```prisma
// Unique transaction ID prevents duplicate payments
transaction_id String @unique

// Composite unique prevents duplicate attendance
@@unique([student_id, batch_id, date])

// Composite unique prevents duplicate enrollments
@@unique([student_id, batch_id])

// Composite unique prevents duplicate submissions
@@unique([assignment_id, student_id])
```

### Soft Deletes
```prisma
deleted_at DateTime?
```

Applied to: User, Course, Batch, StudyMaterial, Assignment, Announcement

## Migration Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Apply migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open Prisma Studio
npm run prisma:studio
```

## Performance Tips

1. **Always use indexes for WHERE clauses**
2. **Use transactions for multi-step operations**
3. **Limit query results with `take` and `skip`**
4. **Use `select` to fetch only needed fields**
5. **Use `include` sparingly (N+1 problem)**
6. **Cache frequently accessed data (Redis)**
7. **Use connection pooling (Supabase Pooler)**

## Security

- All passwords hashed with bcrypt
- Soft deletes maintain referential integrity
- Audit logs track all critical actions
- Unique constraints prevent duplicate operations
- Transactions ensure data consistency
