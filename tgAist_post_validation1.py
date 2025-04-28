import os
from db_utils import get_db_connection, save_project, link_post_to_project

# List of project names to check for
projects = [
    "HEMI", "Sophon", "FUEL", "CARV", "Moonveil", "ICN", "Aethir"
]

def process_posts():
    """Process posts and link them to projects"""
    # First, save all projects to database and get their IDs
    project_ids = {}
    for project_name in projects:
        project_id = save_project(project_name)
        if project_id:
            project_ids[project_name] = project_id
            print(f"Project {project_name} saved with ID {project_id}")

    # Connect to database
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Get all posts
            cur.execute("""
                SELECT id, message_text FROM telegram_posts
            """)
            posts = cur.fetchall()

            # Process each post
            for post_id, message_text in posts:
                # Convert text to lowercase for case-insensitive search
                lower_text = message_text.lower()
                
                # Check each project
                for project_name, project_id in project_ids.items():
                    if project_name.lower() in lower_text:
                        # Link post to project
                        link_post_to_project(post_id, project_id)
                        print(f"Linked post {post_id} to project {project_name}")

if __name__ == '__main__':
    process_posts()