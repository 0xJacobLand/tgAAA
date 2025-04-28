-- Create tables for Telegram posts database

-- Table for storing channel information
CREATE TABLE telegram_channels (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    subscribers_count INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing posts
CREATE TABLE telegram_posts (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES telegram_channels(id),
    message_id BIGINT NOT NULL,
    post_date TIMESTAMP WITH TIME ZONE NOT NULL,
    message_text TEXT,
    comments_count INTEGER DEFAULT 0,
    reactions_count INTEGER DEFAULT 0,
    reposts_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, message_id)
);

-- Table for storing projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for linking posts with projects
CREATE TABLE post_projects (
    post_id INTEGER REFERENCES telegram_posts(id),
    project_id INTEGER REFERENCES projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, project_id)
);

-- Create indexes for better performance
CREATE INDEX idx_telegram_posts_channel_id ON telegram_posts(channel_id);
CREATE INDEX idx_telegram_posts_post_date ON telegram_posts(post_date);
CREATE INDEX idx_post_projects_post_id ON post_projects(post_id);
CREATE INDEX idx_post_projects_project_id ON post_projects(project_id); 