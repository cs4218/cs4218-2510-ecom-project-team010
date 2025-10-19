# insert_data.py

import pymongo
from bson import json_util
import os
import time

# --- Connection Details (defaults to your docker-compose setup) ---
MONGO_HOST = os.environ.get("MONGO_HOST", "mongo")
MONGO_PORT = int(os.environ.get("MONGO_PORT", 27017))
MONGO_USER = os.environ.get("MONGO_USER", "user")
MONGO_PASS = os.environ.get("MONGO_PASS", "password")
MONGO_DB = os.environ.get("MONGO_DB", "test")

# --- Data files and their target collection names ---
DATA_FILES = {
    "test.users.json": "users",
    "test.categories.json": "categories",
    "test.products.json": "products",
    "test.orders.json": "orders"
}

# --- Retry connection to wait for MongoDB to start ---
retries = 10
while retries > 0:
    try:
        print("Attempting to connect to MongoDB...")
        client = pymongo.MongoClient(
            host=MONGO_HOST,
            port=MONGO_PORT,
            username=MONGO_USER,
            password=MONGO_PASS,
            authSource='admin',
            serverSelectionTimeoutMS=5000
        )
        # Check if the connection is successful
        client.admin.command('ismaster')
        print("MongoDB connection successful.")
        break
    except pymongo.errors.ServerSelectionTimeoutError as err:
        retries -= 1
        print(f"Connection failed, retrying in 5 seconds... ({retries} retries left)")
        time.sleep(5)
        if retries == 0:
            print("Could not connect to MongoDB. Exiting.")
            exit(1)

# --- Select the database ---
db = client[MONGO_DB]

# --- Iterate over files and insert data into collections ---
for filename, collection_name in DATA_FILES.items():
    if os.path.exists(filename):
        try:
            # Drop collection to avoid duplicates on re-runs
            if collection_name in db.list_collection_names():
                print(f"Dropping existing collection: {collection_name}")
                db[collection_name].drop()

            with open(filename, 'r') as f:
                # Use bson.json_util to parse MongoDB's extended JSON format
                data = json_util.loads(f.read())
                if data:
                    collection = db[collection_name]
                    collection.insert_many(data)
                    print(f"Successfully inserted {len(data)} documents into '{collection_name}'.")
                else:
                    print(f"No data to insert for '{collection_name}'.")
        except Exception as e:
            print(f"An error occurred while processing {filename}: {e}")
    else:
        print(f"Data file not found: {filename}")

client.close()
print("Data insertion complete. Closing connection.")