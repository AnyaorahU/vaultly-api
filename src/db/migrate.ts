import { pool } from "../config/database";

const userSchema = async (): Promise<void> => {
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
};

const paymentSchema = async (): Promise<void> => {
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
};

const webhookEventSchema = async (): Promise<void> => {
  await pool.query(`CREATE TABLE webhook_events (
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

const indexSchema = async (): Promise<void> => {
  await pool.query(`CREATE INDEX idx_user_email
    ON users (email);`);
  await pool.query(`CREATE INDEX idx_payment_user_id
    ON payments (user_id);
    `);
  await pool.query(`CREATE INDEX idx_payment_provider_intent_id
    ON payments (provider_intent_id);`);
  await pool.query(`CREATE INDEX idx_webhook_events_stripe_event_id
    ON webhook_events (stripe_event_id);
    `);
  await pool.query(`CREATE INDEX idx_webhook_events_payment_id
    ON webhook_events (payment_id);`);
};

const runMigrattion = async (): Promise<void> => {
  try {
    await userSchema();
    console.log("users table created");
    await paymentSchema();
    console.log("payments table created");
    await webhookEventSchema();
    console.log("webhook events table created");

    await indexSchema();
    console.log("indexes table created");
  } catch (error) {
    console.error(`Migration Error: ${error}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrattion();
