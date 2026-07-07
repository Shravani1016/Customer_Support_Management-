"""merge heads: super_admin_role and files_table branches

Revision ID: 7014908f83b1
Revises: be4925e68ec1, d961d86fbb5f
Create Date: 2026-07-07 10:24:42.411111

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7014908f83b1'
down_revision: Union[str, Sequence[str], None] = ('be4925e68ec1', 'd961d86fbb5f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
