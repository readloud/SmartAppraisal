-- postgres/init.sql
-- Initialize database with extensions and schema

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create application user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'appraiser') THEN
        CREATE USER appraiser WITH PASSWORD 'secure_password_here';
    END IF;
END
$$;

-- Create database
CREATE DATABASE appraisal OWNER appraiser;

-- Connect to appraisal database
\c appraisal

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE appraisal TO appraiser;

-- Set search path
ALTER DATABASE appraisal SET search_path TO public;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public AUTHORIZATION appraiser;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO appraiser;
GRANT ALL ON SCHEMA public TO public;

-- Enable row level security
ALTER DATABASE appraisal SET "app.jwt.claim" TO '{"role":"anonymous"}';

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        current_setting('app.current_user_id', TRUE)::UUID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create partitioned tables for transactions
CREATE TABLE IF NOT EXISTS transactions_partitioned (
    LIKE transactions INCLUDING DEFAULTS INCLUDING CONSTRAINTS
) PARTITION BY RANGE (transaction_date);

-- Create monthly partitions
DO $$
DECLARE
    start_date date;
    end_date date;
    partition_name text;
BEGIN
    FOR i IN 0..11 LOOP
        start_date := date_trunc('month', CURRENT_DATE - (i || ' months')::interval);
        end_date := date_trunc('month', start_date + interval '1 month');
        partition_name := 'transactions_' || to_char(start_date, 'YYYY_MM');
        
        IF NOT EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = partition_name
        ) THEN
            EXECUTE format('
                CREATE TABLE %I PARTITION OF transactions_partitioned
                FOR VALUES FROM (%L) TO (%L)
            ', partition_name, start_date, end_date);
        END IF;
    END LOOP;
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
CREATE INDEX IF NOT EXISTS idx_units_imei ON units(imei);
CREATE INDEX IF NOT EXISTS idx_units_brand_model ON units(brand_id, model_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- Create views for reporting
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    DATE(transaction_date) as sale_date,
    COUNT(*) as total_transactions,
    SUM(purchase_price) as total_purchase,
    SUM(selling_price) as total_selling,
    SUM(profit) as total_profit,
    AVG(profit) as avg_profit,
    COUNT(DISTINCT user_id) as active_users
FROM transactions
WHERE status = 'completed'
GROUP BY DATE(transaction_date)
ORDER BY sale_date DESC;

CREATE OR REPLACE VIEW model_performance AS
SELECT 
    b.name as brand,
    m.name as model,
    COUNT(t.id) as units_sold,
    AVG(t.purchase_price) as avg_purchase_price,
    AVG(t.selling_price) as avg_selling_price,
    AVG(t.profit) as avg_profit,
    SUM(t.profit) as total_profit,
    AVG(t.days_to_sell) as avg_days_to_sell
FROM transactions t
JOIN units u ON t.unit_id = u.id
JOIN models m ON u.model_id = m.id
JOIN brands b ON m.brand_id = b.id
WHERE t.status = 'completed'
GROUP BY b.name, m.name
ORDER BY total_profit DESC;
