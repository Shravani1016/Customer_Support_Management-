"""merge migration heads

Revision ID: 3f63cc2c47b4
Revises: 7014908f83b1, c5427dc9b7fc
Create Date: 2026-07-08 07:21:42.114797

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3f63cc2c47b4'
down_revision: Union[str, Sequence[str], None] = ('7014908f83b1', 'c5427dc9b7fc')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
