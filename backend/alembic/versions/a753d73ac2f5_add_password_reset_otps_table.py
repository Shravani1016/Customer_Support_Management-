"""add password reset otps table

Revision ID: a753d73ac2f5
Revises: 04fbe919cb99
Create Date: 2026-07-06 12:41:31.693848

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a753d73ac2f5'
down_revision: Union[str, Sequence[str], None] = '04fbe919cb99'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
    'password_reset_otps',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('otp', sa.String(), nullable=False),
    sa.Column('reset_token', sa.String(), nullable=True),
    sa.Column('is_used', sa.Boolean(), nullable=True),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
     )
    op.create_index(op.f('ix_password_reset_otps_email'), 'password_reset_otps', ['email'], unique=False)
    op.create_index(op.f('ix_password_reset_otps_id'), 'password_reset_otps', ['id'], unique=False)
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP INDEX IF EXISTS ix_password_reset_otps_id")
    op.execute("DROP INDEX IF EXISTS ix_password_reset_otps_email")
    op.execute("DROP TABLE IF EXISTS password_reset_otps")
    # ### end Alembic commands ###
