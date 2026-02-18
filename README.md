# Institutional Management System

A complete academic operations and financial management web application for coaching centers.

## Project Structure

```
institutional-management/
├── backend/          # Node.js + Express + Prisma backend
├── frontend/         # Next.js frontend
└── shared/           # Shared types and utilities
```

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Database**: PostgreSQL via Supabase
- **Cache**: Upstash Redis
- **Storage**: Supabase Storage
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)

## Features

- Student lifecycle management (registration to completion)
- Course & batch management
- Attendance tracking
- Payment handling with invoice generation
- Study materials & assignments
- Role-based access control (Super Admin, Admin, Teacher, Staff, Student)
- Real-time notifications
- Comprehensive reporting & analytics
- Audit logging

## Getting Started

See individual README files in `backend/` and `frontend/` directories.

## Architecture

- **Modular Monolith**: Clean Architecture with microservices migration path
- **Connection Pooling**: Supabase Pooler + Prisma (100-200 connections)
- **Caching**: 3-tier (CDN → Redis → Database)
- **Rate Limiting**: Role-based with Upstash
- **Scalability**: Supports 20,000 concurrent users

## Documentation

- [Implementation Plan](../brain/88884a70-c2a2-4ead-ad02-71a8f6040fc6/implementation_plan.md)
- [Scalability Architecture](../brain/88884a70-c2a2-4ead-ad02-71a8f6040fc6/scalability_architecture.md)

## License

Proprietary - Single-tenant deployable product
