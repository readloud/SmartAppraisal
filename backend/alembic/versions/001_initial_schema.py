# backend/alembic/versions/001_initial_schema.py
"""
Initial database schema
Revision ID: 001
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    
    # ==================== USERS TABLE ====================
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(100), nullable=False),
        sa.Column('role', sa.Enum('admin', 'karyawan', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_role', 'users', ['role'])

    # ==================== SESSIONS TABLE ====================
    op.create_table(
        'sessions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('token', sa.String(500), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_foreign_key('fk_sessions_user', 'sessions', 'users', ['user_id'], ['id'], ondelete='CASCADE')

    # ==================== MASTER DATA TABLES ====================
    op.create_table(
        'brands',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('logo_url', sa.String(500)),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        'models',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('brand_id', UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('launch_year', sa.Integer()),
        sa.Column('release_price', sa.Numeric(15, 2)),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_foreign_key('fk_models_brand', 'models', 'brands', ['brand_id'], ['id'], ondelete='CASCADE')
    op.create_unique_constraint('uq_models_brand_name', 'models', ['brand_id', 'name'])

    op.create_table(
        'variants',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('model_id', UUID(as_uuid=True), nullable=False),
        sa.Column('ram', sa.Integer(), nullable=False),
        sa.Column('rom', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_foreign_key('fk_variants_model', 'variants', 'models', ['model_id'], ['id'], ondelete='CASCADE')
    op.create_unique_constraint('uq_variants_model_ram_rom', 'variants', ['model_id', 'ram', 'rom'])

    op.create_table(
        'colors',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(50), nullable=False, unique=True),
        sa.Column('hex_code', sa.String(7)),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        'physical_conditions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('label', sa.String(50), nullable=False, unique=True),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('description', sa.String(500)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        'accessories',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('weight', sa.Numeric(3, 2), server_default='1.0'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # ==================== UNITS TABLE ====================
    op.create_table(
        'units',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('imei', sa.String(15), unique=True),
        sa.Column('brand_id', UUID(as_uuid=True), nullable=False),
        sa.Column('model_id', UUID(as_uuid=True), nullable=False),
        sa.Column('variant_id', UUID(as_uuid=True), nullable=False),
        sa.Column('color_id', UUID(as_uuid=True), nullable=False),
        sa.Column('physical_condition_id', UUID(as_uuid=True), nullable=False),
        sa.Column('battery_health', sa.Integer()),
        sa.Column('accessories', JSONB, server_default='[]'),
        sa.Column('notes', sa.Text()),
        sa.Column('purchase_price', sa.Numeric(15, 2)),
        sa.Column('selling_price', sa.Numeric(15, 2)),
        sa.Column('status', sa.Enum('appraised', 'bought', 'sold', 'returned', 'void', name='unitstatus'), 
                   server_default='appraised'),
        sa.Column('appraised_by', UUID(as_uuid=True)),
        sa.Column('appraised_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('bought_at', sa.DateTime()),
        sa.Column('sold_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    # Foreign keys
    op.create_foreign_key('fk_units_brand', 'units', 'brands', ['brand_id'], ['id'])
    op.create_foreign_key('fk_units_model', 'units', 'models', ['model_id'], ['id'])
    op.create_foreign_key('fk_units_variant', 'units', 'variants', ['variant_id'], ['id'])
    op.create_foreign_key('fk_units_color', 'units', 'colors', ['color_id'], ['id'])
    op.create_foreign_key('fk_units_condition', 'units', 'physical_conditions', ['physical_condition_id'], ['id'])
    op.create_foreign_key('fk_units_appraiser', 'units', 'users', ['appraised_by'], ['id'])
    
    # Indexes
    op.create_index('ix_units_status', 'units', ['status'])
    op.create_index('ix_units_imei', 'units', ['imei'])
    op.create_index('ix_units_brand_model', 'units', ['brand_id', 'model_id'])
    op.create_index('ix_units_appraised_at', 'units', ['appraised_at'])

    # ==================== TRANSACTIONS TABLE ====================
    op.create_table(
        'transactions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('unit_id', UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('purchase_price', sa.Numeric(15, 2), nullable=False),
        sa.Column('selling_price', sa.Numeric(15, 2)),
        sa.Column('profit', sa.Numeric(15, 2)),
        sa.Column('status', sa.Enum('pending', 'completed', 'cancelled', name='transactionstatus'),
                   server_default='pending'),
        sa.Column('transaction_date', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('notes', sa.Text()),
        sa.Column('market_price_at_time', sa.Numeric(15, 2)),
        sa.Column('rule_engine_version', sa.String(20)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_foreign_key('fk_transactions_unit', 'transactions', 'units', ['unit_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_transactions_user', 'transactions', 'users', ['user_id'], ['id'])
    op.create_index('ix_transactions_date', 'transactions', ['transaction_date'])
    op.create_index('ix_transactions_status', 'transactions', ['status'])
    op.create_index('ix_transactions_user', 'transactions', ['user_id'])

    # ==================== PRICE HISTORY TABLE ====================
    op.create_table(
        'price_history',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('unit_id', UUID(as_uuid=True), nullable=False),
        sa.Column('old_price', sa.Numeric(15, 2)),
        sa.Column('new_price', sa.Numeric(15, 2)),
        sa.Column('changed_by', UUID(as_uuid=True)),
        sa.Column('reason', sa.Text()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_foreign_key('fk_price_history_unit', 'price_history', 'units', ['unit_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_price_history_changer', 'price_history', 'users', ['changed_by'], ['id'])

    # ==================== AUDIT LOGS TABLE ====================
    op.create_table(
        'audit_logs',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True)),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('table_name', sa.String(50)),
        sa.Column('record_id', UUID(as_uuid=True)),
        sa.Column('old_data', sa.Text()),
        sa.Column('new_data', sa.Text()),
        sa.Column('ip_address', sa.String(45)),
        sa.Column('user_agent', sa.Text()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_foreign_key('fk_audit_logs_user', 'audit_logs', 'users', ['user_id'], ['id'])
    op.create_index('ix_audit_logs_created', 'audit_logs', ['created_at'])
    op.create_index('ix_audit_logs_user', 'audit_logs', ['user_id'])

    # ==================== ML TRAINING DATA TABLE ====================
    op.create_table(
        'ml_training_data',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('unit_id', UUID(as_uuid=True), nullable=False),
        sa.Column('features', JSONB, nullable=False),
        sa.Column('actual_price', sa.Numeric(15, 2), nullable=False),
        sa.Column('predicted_price', sa.Numeric(15, 2)),
        sa.Column('model_version', sa.String(50)),
        sa.Column('is_used_for_training', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_foreign_key('fk_ml_training_unit', 'ml_training_data', 'units', ['unit_id'], ['id'], ondelete='CASCADE')
    op.create_index('ix_ml_training_used', 'ml_training_data', ['is_used_for_training'])

    # ==================== SYSTEM CONFIGS TABLE ====================
    op.create_table(
        'system_configs',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('key', sa.String(100), nullable=False, unique=True),
        sa.Column('value', JSONB, nullable=False),
        sa.Column('description', sa.String(500)),
        sa.Column('updated_by', UUID(as_uuid=True)),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_foreign_key('fk_configs_updater', 'system_configs', 'users', ['updated_by'], ['id'])

    # ==================== INITIAL DATA ====================
    # Insert default admin user (password: admin123)
    op.execute("""
        INSERT INTO users (id, email, password_hash, full_name, role) 
        VALUES (
            gen_random_uuid(),
            'admin@company.com',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewZyQYi5tIcoZR9m',
            'System Admin',
            'admin'
        )
    """)

    # Insert physical conditions
    op.execute("""
        INSERT INTO physical_conditions (id, label, score, description) VALUES
            (gen_random_uuid(), 'Mint', 100, 'Like new, no scratches'),
            (gen_random_uuid(), 'Excellent', 90, 'Minor signs of use'),
            (gen_random_uuid(), 'Good', 75, 'Visible wear, fully functional'),
            (gen_random_uuid(), 'Fair', 55, 'Significant wear, functional'),
            (gen_random_uuid(), 'Poor', 35, 'Heavy wear, may have issues')
    """)

    # Insert default accessories
    op.execute("""
        INSERT INTO accessories (id, name, weight) VALUES
            (gen_random_uuid(), 'Box', 1.0),
            (gen_random_uuid(), 'Charger', 0.8),
            (gen_random_uuid(), 'Cable', 0.6),
            (gen_random_uuid(), 'Earphone', 0.4),
            (gen_random_uuid(), 'Original Invoice', 0.3),
            (gen_random_uuid(), 'Screen Protector', 0.2),
            (gen_random_uuid(), 'Case', 0.2)
    """)


def downgrade() -> None:
    """Rollback migration"""
    # Drop tables in reverse order
    op.drop_table('ml_training_data')
    op.drop_table('system_configs')
    op.drop_table('price_history')
    op.drop_table('audit_logs')
    op.drop_table('transactions')
    op.drop_table('units')
    op.drop_table('accessories')
    op.drop_table('physical_conditions')
    op.drop_table('colors')
    op.drop_table('variants')
    op.drop_table('models')
    op.drop_table('brands')
    op.drop_table('sessions')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS unitstatus')
    op.execute('DROP TYPE IF EXISTS transactionstatus')
    op.execute('DROP TYPE IF EXISTS userrole')
