"""add_is_active_to_crm_entities

Revision ID: c49aba42c9a0
Revises: 7014908f83b1
Create Date: 2026-07-07 18:15:49.045951

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c49aba42c9a0'
down_revision: Union[str, Sequence[str], None] = '7014908f83b1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('leads', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('contacts', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('companies', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('deals', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('leads', 'is_active')
    op.drop_column('contacts', 'is_active')
    op.drop_column('companies', 'is_active')
    op.drop_column('deals', 'is_active')