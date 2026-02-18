import { prisma } from './src/common/config/database';

async function main() {
    console.log('--- Manually Creating Tables ---');

    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "audit_logs" (
                "id" TEXT NOT NULL,
                "user_id" TEXT NOT NULL,
                "action" TEXT NOT NULL,
                "entity" TEXT NOT NULL,
                "entity_id" TEXT NOT NULL,
                "old_value" JSONB,
                "new_value" JSONB,
                "ip_address" TEXT,
                "user_agent" TEXT,
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('✅ Table "audit_logs" created or already exists');

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
                "id" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "token" TEXT NOT NULL,
                "expires_at" TIMESTAMP(3) NOT NULL,
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('✅ Table "password_reset_tokens" created or already exists');

        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
        `);
        console.log('✅ Unique index on "token" created');

        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");
        `);
        console.log('✅ Index on "email" created');

    } catch (error) {
        console.error('❌ Failed to create tables:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
