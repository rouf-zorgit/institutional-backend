import { supabaseAdmin } from './src/common/config/supabase';
import { redis } from './src/common/config/redis';
import { prisma } from './src/common/config/database';

async function testConnections() {
    console.log('--- Testing Connections ---');

    // Test Prisma/Database
    try {
        await prisma.$connect();
        console.log('✅ Database (Prisma): Connected successfully');
    } catch (error) {
        console.error('❌ Database (Prisma): Connection failed', error);
    }

    // Test Redis
    try {
        const ping = await redis.ping();
        console.log('✅ Redis: Connected successfully (Ping:', ping, ')');
    } catch (error) {
        console.error('❌ Redis: Connection failed', error);
    }

    // Test Supabase
    try {
        const { data, error } = await supabaseAdmin.from('_dummy_table_check').select('*').limit(1);
        // Even if table doesn't exist, if we get a response (even 404/401), it means we reached Supabase
        // But better test something standard like auth or a real table if known.
        // Let's just try to list buckets or something harmless.
        const { data: buckets, error: storageError } = await supabaseAdmin.storage.listBuckets();
        if (storageError) {
            console.error('❌ Supabase: Connection failed (Storage Error:', storageError.message, ')');
        } else {
            console.log('✅ Supabase: Connected successfully');
        }
    } catch (error) {
        console.error('❌ Supabase: Connection failed', error);
    }

    console.log('--- Test Complete ---');
    process.exit(0);
}

testConnections();
