import os
from urllib.parse import urlparse

# Get database URL from environment variable or use local config
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    # Parse the database URL
    url = urlparse(DATABASE_URL)
    DB_CONFIG = {
        'dbname': url.path[1:],
        'user': url.username,
        'password': url.password,
        'host': url.hostname,
        'port': url.port
    }
else:
    # Local development configuration
    DB_CONFIG = {
        'dbname': 'tgaaa_db',
        'user': 'jacob',  # your system username
        'password': '',   # leave empty for local development
        'host': 'localhost',
        'port': '5432'
    } 