from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db_utils import get_db_connection
from typing import List
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vue.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Channel(BaseModel):
    id: int
    username: str
    title: str
    description: str
    subscribers_count: int
    last_updated: datetime

class Post(BaseModel):
    id: int
    channel_id: int
    message_id: int
    post_date: datetime
    message_text: str
    comments_count: int
    reactions_count: int
    reposts_count: int
    views_count: int
    created_at: datetime

class Project(BaseModel):
    id: int
    name: str
    created_at: datetime

class ProjectStats(BaseModel):
    name: str
    mentions_count: int

@app.get("/channels", response_model=List[Channel])
async def get_channels():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, username, title, description, subscribers_count, last_updated
                FROM telegram_channels
                ORDER BY subscribers_count DESC
            """)
            channels = cur.fetchall()
            return [Channel(
                id=row[0],
                username=row[1],
                title=row[2],
                description=row[3],
                subscribers_count=row[4],
                last_updated=row[5]
            ) for row in channels]

@app.get("/posts", response_model=List[Post])
async def get_posts(channel_id: int = None, project_id: int = None):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            query = """
                SELECT p.id, p.channel_id, p.message_id, p.post_date, p.message_text,
                       p.comments_count, p.reactions_count, p.reposts_count, p.views_count, p.created_at
                FROM telegram_posts p
            """
            params = []
            
            if channel_id:
                query += " WHERE p.channel_id = %s"
                params.append(channel_id)
            
            if project_id:
                if channel_id:
                    query += " AND"
                else:
                    query += " WHERE"
                query += " EXISTS (SELECT 1 FROM post_projects pp WHERE pp.post_id = p.id AND pp.project_id = %s)"
                params.append(project_id)
            
            query += " ORDER BY p.post_date DESC"
            
            cur.execute(query, params)
            posts = cur.fetchall()
            return [Post(
                id=row[0],
                channel_id=row[1],
                message_id=row[2],
                post_date=row[3],
                message_text=row[4],
                comments_count=row[5],
                reactions_count=row[6],
                reposts_count=row[7],
                views_count=row[8],
                created_at=row[9]
            ) for row in posts]

@app.get("/projects", response_model=List[Project])
async def get_projects():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, name, created_at
                FROM projects
                ORDER BY name
            """)
            projects = cur.fetchall()
            return [Project(
                id=row[0],
                name=row[1],
                created_at=row[2]
            ) for row in projects]

@app.get("/stats/projects", response_model=List[ProjectStats])
async def get_project_stats():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT p.name, COUNT(pp.post_id) as mentions_count
                FROM projects p
                LEFT JOIN post_projects pp ON p.id = pp.project_id
                GROUP BY p.name
                ORDER BY mentions_count DESC
            """)
            stats = cur.fetchall()
            return [ProjectStats(
                name=row[0],
                mentions_count=row[1]
            ) for row in stats]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 