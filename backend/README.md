# Backend - Institutional Management System

Node.js + Express + TypeScript + Prisma backend for the Institutional Management System.

## Features

- **Modular Architecture**: Clean Architecture with Domain/Application/Infrastructure layers
- **Type Safety**: Full TypeScript with strict mode
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Caching**: Upstash Redis for high-performance caching
- **Rate Limiting**: Role-based rate limiting with Upstash
- **Authentication**: JWT with access and refresh tokens
- **Validation**: Zod schemas for all inputs
- **Security**: Helmet, CORS, input sanitization
- **Scalability**: Connection pooling, auto-scaling ready

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL (via Supabase)
- Redis (via Upstash)

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with actual values

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## Project Structure

```
src/
├── modules/           # Business modules (bounded contexts)
│   ├── auth/         # Authentication & authorization
│   ├── users/        # User management
│   ├── courses/      # Course management
│   ├── batches/      # Batch management
│   ├── payments/     # Payment processing
│   └── ...
├── common/           # Shared infrastructure
│   ├── middleware/   # Express middleware
│   ├── config/       # Configuration
│   ├── utils/        # Utilities
│   └── types/        # TypeScript types
├── api/              # API gateway
└── app.ts            # Application entry point
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run test` - Run tests
- `npm run lint` - Lint code

## Environment Variables

See `.env.example` for all required environment variables.

## API Documentation

API will be available at `http://localhost:3001/api/v1`

## License

Proprietary
