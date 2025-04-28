from db_utils import get_db_connection

def clean_projects():
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Delete specific projects
            cur.execute("""
                DELETE FROM projects 
                WHERE name IN ('IDO research', 'NFD', 'Combine')
            """)
            conn.commit()
            print("Successfully removed projects: IDO research, NFD, Combine")
            
            # Check remaining projects
            cur.execute("SELECT name FROM projects")
            remaining = cur.fetchall()
            print("\nRemaining projects:")
            for project in remaining:
                print(f"- {project[0]}")
            
    except Exception as e:
        print(f"Error cleaning projects: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    clean_projects() 