from db_utils import get_db_connection

def check_data():
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Check channels
            cur.execute("SELECT COUNT(*) FROM telegram_channels")
            channels_count = cur.fetchone()[0]
            print(f"Total channels: {channels_count}")
            
            # Check projects
            cur.execute("SELECT COUNT(*) FROM projects")
            projects_count = cur.fetchone()[0]
            print(f"Total projects: {projects_count}")
            
            # Print all channels
            print("\nChannels:")
            cur.execute("SELECT username, title, subscribers_count FROM telegram_channels")
            for row in cur.fetchall():
                print(f"- {row[0]} ({row[1]}): {row[2]} subscribers")
            
            # Print all projects
            print("\nProjects:")
            cur.execute("SELECT name FROM projects")
            for row in cur.fetchall():
                print(f"- {row[0]}")
            
    except Exception as e:
        print(f"Error checking data: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_data() 