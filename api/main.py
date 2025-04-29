from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db_utils import get_db_connection
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import os
import re

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

@app.get("/api/kol30")
async def get_kol30():
    try:
        directory_path = os.path.join(os.path.dirname(__file__), '..', 'valid_idoresearch')
        if not os.path.exists(directory_path):
            return []
            
        files = os.listdir(directory_path)
        project_counts = {}
        
        for file in files:
            # Извлекаем имя проекта, учитывая черточки
            date_match = re.search(r'_(20\d{6}|202\d)_', file)
            
            if date_match:
                # Получаем индекс начала даты
                date_index = file.index(date_match.group(0))
                # Находим начало имени проекта (после первого подчеркивания)
                start_index = file.index('_') + 1
                # Извлекаем имя проекта (от первого _ до даты)
                project_name = file[start_index:date_index]
                
                project_counts[project_name] = project_counts.get(project_name, 0) + 1
            else:
                # Если не нашли дату, используем оригинальный подход
                match = re.search(r'_([^_]+)_', file)
                if match and match.group(1):
                    project_name = match.group(1)
                    project_counts[project_name] = project_counts.get(project_name, 0) + 1
        
        # Преобразуем в массив объектов с именем и количеством через запятую
        projects = [{"name": f"{project_name}, {count}"} 
                   for project_name, count in project_counts.items()]
        
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/channel-info")
async def get_channel_info():
    try:
        directory_path = os.path.join(os.path.dirname(__file__), '..', 'kolsdata')
        if not os.path.exists(directory_path):
            return []
            
        files = os.listdir(directory_path)
        channel_infos = []
        
        for file in files:
            file_path = os.path.join(directory_path, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    lines = content.split('\n')
                    values = [line.split(': ')[1].strip() 
                            for line in lines 
                            if ': ' in line and line.split(': ')[1].strip()]
                    info_string = ', '.join(values)
                    channel_infos.append(info_string)
            except Exception as file_error:
                print(f"Error reading file {file_path}: {str(file_error)}")
                continue
        
        return channel_infos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/kolastpost")
async def get_kol_last_post():
    try:
        directory_path = os.path.join(os.path.dirname(__file__), '..', 'valid_idoresearch')
        if not os.path.exists(directory_path):
            return []
            
        files = [f for f in os.listdir(directory_path) if f.endswith('.txt')]
        if not files:
            return []
            
        kol_posts: Dict[str, Dict[str, Any]] = {}
        
        for file in files:
            # Ищем дату в формате YYYYMMDD в имени файла
            date_match = re.search(r'_(\d{8})_', file)
            if not date_match:
                continue
                
            date_str = date_match.group(1)
            date_position = file.index(f"_{date_str}_")
            
            # Находим первое подчеркивание
            first_underscore_pos = file.find('_')
            if first_underscore_pos < 0 or first_underscore_pos >= date_position:
                continue
                
            # Извлекаем имя KOL
            kol_name = file[first_underscore_pos + 1:date_position]
            
            # Извлекаем статистику
            stats_match = re.search(r'(\d+),(\d+),(\d+),(\d+)\.txt$', file)
            if not stats_match:
                stats_match = re.search(r'(\d+),(\d+),(\d+),(\d+)[,\d]*\.txt$', file)
            
            stats = ''
            if stats_match:
                stats = f"{stats_match.group(1)},{stats_match.group(2)},{stats_match.group(3)},{stats_match.group(4)}"
            
            # Читаем содержимое файла
            try:
                file_path = os.path.join(directory_path, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Обновляем информацию только если это первый или более новый пост
                    if kol_name not in kol_posts or date_str > kol_posts[kol_name]['date']:
                        kol_posts[kol_name] = {
                            'kolName': kol_name,
                            'date': f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}",
                            'fileName': file,
                            'stats': stats,
                            'content': content
                        }
            except Exception as file_error:
                print(f"Error reading file {file}: {str(file_error)}")
                continue
        
        # Преобразуем в список и сортируем по имени KOL
        result = sorted(kol_posts.values(), key=lambda x: x['kolName'])
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects")
async def get_projects():
    try:
        directory_path = os.path.join(os.path.dirname(__file__), '..', 'valid_idoresearch')
        if not os.path.exists(directory_path):
            return []
            
        files = [f for f in os.listdir(directory_path) if f.endswith('.txt')]
        project_counts = {}
        
        for file in files:
            # Извлекаем имя проекта из начала имени файла
            project_name = file.split('_')[0]
            if project_name:
                project_counts[project_name] = project_counts.get(project_name, 0) + 1
        
        # Преобразуем в массив объектов
        projects = [{"name": project_name, "mentions": count} 
                   for project_name, count in project_counts.items()]
        
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 