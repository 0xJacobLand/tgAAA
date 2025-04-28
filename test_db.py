from db_utils import get_db_connection

def test_connection():
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            version = cur.fetchone()
            print("Successfully connected to PostgreSQL!")
            print("PostgreSQL version:", version[0])
    except Exception as e:
        print("Error connecting to PostgreSQL:", e)
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    test_connection() 