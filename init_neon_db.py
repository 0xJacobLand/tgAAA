import os
import psycopg2
from urllib.parse import urlparse

# Parse the database URL
url = urlparse("postgresql://neondb_owner:npg_BSoDYEl2xi5T@ep-twilight-art-a1xokw1c-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require")

# Connect to the database
conn = psycopg2.connect(
    dbname=url.path[1:],
    user=url.username,
    password=url.password,
    host=url.hostname,
    port=url.port,
    sslmode='require'
)

try:
    with conn.cursor() as cur:
        # Read and execute the SQL script
        with open('create_tables.sql', 'r') as f:
            sql_script = f.read()
            cur.execute(sql_script)
        conn.commit()
        print("Database schema successfully created in Neon!")
except Exception as e:
    print("Error creating database schema:", e)
finally:
    conn.close() 