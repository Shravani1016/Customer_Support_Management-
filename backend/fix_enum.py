from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TYPE leadstatusenum ADD VALUE IF NOT EXISTS 'lost'"))
    conn.commit()
    print("Enum updated successfully.")

    result = conn.execute(text("SELECT enum_range(NULL::leadstatusenum)"))
    print("Current enum values:", result.scalar())