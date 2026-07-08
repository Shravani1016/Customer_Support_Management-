from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # First, list actual column names
    result = conn.execute(text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'users'
    """))
    print("Columns in users table:")
    for row in result:
        print(" -", row[0])

    print()

    # Then dump all rows so we can see actual data
    result = conn.execute(text("SELECT * FROM users"))
    print("Rows:")
    for row in result:
        print(row)