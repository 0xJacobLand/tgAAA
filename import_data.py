import os
import re
from datetime import datetime
from db_utils import save_channel_info, save_post, save_project, link_post_to_project

def parse_channel_info(file_path):
    """Parse channel information from text file"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    info = {}
    # Extract username
    username_match = re.search(r'Юзернейм: (.+)', content)
    if username_match:
        info['username'] = username_match.group(1).strip()
    
    # Extract title
    title_match = re.search(r'Имя канала: (.+)', content)
    if title_match:
        info['title'] = title_match.group(1).strip()
    
    # Extract description
    desc_match = re.search(r'Описание канала: (.+?)(?=Проекты:|$)', content, re.DOTALL)
    if desc_match:
        info['description'] = desc_match.group(1).strip()
    
    # Extract subscribers count
    subs_match = re.search(r'Количество подписчиков: (\d+)', content)
    if subs_match:
        info['subscribers_count'] = int(subs_match.group(1))
    
    # Extract projects
    projects_match = re.search(r'Проекты: (.+)', content)
    if projects_match:
        projects = [p.strip() for p in projects_match.group(1).split('/')]
        info['projects'] = projects
    
    return info

def import_channel_data(file_path):
    """Import data from a channel file"""
    try:
        # Parse channel info
        channel_info = parse_channel_info(file_path)
        
        # Save channel info
        channel_id = save_channel_info(
            channel_info['username'],
            channel_info['title'],
            channel_info.get('description', ''),
            channel_info.get('subscribers_count', 0)
        )
        
        # Save projects
        if 'projects' in channel_info:
            for project_name in channel_info['projects']:
                save_project(project_name)
        
        print(f"Successfully imported data from {file_path}")
    except Exception as e:
        print(f"Error importing data from {file_path}: {e}")

def main():
    # Process all files in kolsdata directory
    kolsdata_dir = 'kolsdata'
    if os.path.exists(kolsdata_dir):
        for filename in os.listdir(kolsdata_dir):
            if filename.endswith('.txt'):
                file_path = os.path.join(kolsdata_dir, filename)
                import_channel_data(file_path)
    else:
        print(f"Directory {kolsdata_dir} not found")

if __name__ == "__main__":
    main() 