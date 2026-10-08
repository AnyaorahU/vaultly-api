import { pool } from "../config/database";

export const setupTestDb = async () => {
  await pool.query(`
    DROP TABLE IF EXISTS payments CASCADE;
    DROP TABLE IF EXISTS webhook_events CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    `);

  await pool.query(`
        CREATE TABLE users (
        id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),

        name VARCHAR NOT NULL,

        email VARCHAR NOT NULL UNIQUE,

        password TEXT NOT NULL,

        role VARCHAR NOT NULL DEFAULT 'customer',

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
        `);

  await pool.query(`
        CREATE TABLE payments (
        id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),

        user_id UUID NOT NULL
            REFERENCES users(id),

        amount NUMERIC(12, 2) NOT NULL
            CHECK (amount > 0),

        currency VARCHAR NOT NULL DEFAULT 'usd',

        status VARCHAR NOT NULL DEFAULT 'pending'
            CHECK (
                status IN (
                    'pending',
                    'processing',
                    'succeeded',
                    'failed',
                    'cancelled',
                    'refunded'
                )
            ),

        provider VARCHAR NOT NULL DEFAULT 'stripe'
            CHECK (
                provider IN (
                    'stripe',
                    'paystack',
                    'flutterwave'
                )
            ),

        provider_intent_id VARCHAR NOT NULL UNIQUE,

        description TEXT,

        paid_at TIMESTAMPTZ,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );    
        `);

  await pool.query(`
        CREATE TABLE webhook_events (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),

    stripe_event_id VARCHAR NOT NULL UNIQUE,

    payment_id UUID
        REFERENCES payments(id),

    type TEXT NOT NULL,

    payload JSONB NOT NULL,

    processed BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
        `);
};

export const teardownTestDb = async () => {
  await pool.query(`
         DROP TABLE IF EXISTS payments CASCADE;
    DROP TABLE IF EXISTS webhook_events CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
        `);
  await pool.end();
};
