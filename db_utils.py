import psycopg2
from psycopg2.extras import DictCursor
from db_config import DB_CONFIG

def get_db_connection():
    """Create and return a database connection"""
    return psycopg2.connect(**DB_CONFIG)

def save_channel_info(channel_username, title, description, subscribers_count):
    """Save or update channel information"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO telegram_channels (username, title, description, subscribers_count)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (username) DO UPDATE
                SET title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    subscribers_count = EXCLUDED.subscribers_count,
                    last_updated = CURRENT_TIMESTAMP
                RETURNING id
            """, (channel_username, title, description, subscribers_count))
            return cur.fetchone()[0]

def save_post(channel_id, message_id, post_date, message_text, 
              comments_count=0, reactions_count=0, reposts_count=0, views_count=0):
    """Save a post to the database"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO telegram_posts 
                (channel_id, message_id, post_date, message_text, 
                 comments_count, reactions_count, reposts_count, views_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (channel_id, message_id) DO UPDATE
                SET message_text = EXCLUDED.message_text,
                    comments_count = EXCLUDED.comments_count,
                    reactions_count = EXCLUDED.reactions_count,
                    reposts_count = EXCLUDED.reposts_count,
                    views_count = EXCLUDED.views_count
                RETURNING id
            """, (channel_id, message_id, post_date, message_text,
                  comments_count, reactions_count, reposts_count, views_count))
            return cur.fetchone()[0]

def save_project(project_name):
    """Save a project to the database"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO projects (name)
                VALUES (%s)
                ON CONFLICT (name) DO NOTHING
                RETURNING id
            """, (project_name,))
            result = cur.fetchone()
            return result[0] if result else None

def link_post_to_project(post_id, project_id):
    """Link a post to a project"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO post_projects (post_id, project_id)
                VALUES (%s, %s)
                ON CONFLICT (post_id, project_id) DO NOTHING
            """, (post_id, project_id))

def get_channel_id(username):
    """Get channel ID by username"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id FROM telegram_channels WHERE username = %s
            """, (username,))
            result = cur.fetchone()
            return result[0] if result else None 