"""Fix CoverLetter id to integer autoincrement

Revision ID: e6bbed0cad5a
Revises: 887277ef539c
Create Date: 2025-12-07 15:14:55.588595
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'e6bbed0cad5a'
down_revision = '887277ef539c'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('coverletters', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.Integer(),
               existing_nullable=False)

        batch_op.alter_column('application_id',
               existing_type=sa.INTEGER(),
               nullable=False)

    # Create a sequence and attach it to id
    op.execute("""
        CREATE SEQUENCE IF NOT EXISTS coverletters_id_seq;
        SELECT setval('coverletters_id_seq', COALESCE((SELECT MAX(id)+1 FROM coverletters), 1), false);
        ALTER TABLE coverletters ALTER COLUMN id SET DEFAULT nextval('coverletters_id_seq');
    """)

def downgrade():
    # Remove sequence default
    op.execute("""
        ALTER TABLE coverletters ALTER COLUMN id DROP DEFAULT;
        DROP SEQUENCE IF EXISTS coverletters_id_seq;
    """)

    with op.batch_alter_table('coverletters', schema=None) as batch_op:
        batch_op.alter_column('application_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('id',
               existing_type=sa.Integer(),
               type_=sa.VARCHAR(length=50),
               existing_nullable=False)
