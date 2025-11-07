from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from fastapi import FastAPI, Request
import os

# Global client variable
db_client: AsyncIOMotorClient | None = None

def get_database(request: Request) -> AsyncIOMotorDatabase:
    """
    Returns the MongoDB database instance from the app state.
    """
    if not hasattr(request.app.state, "db") or request.app.state.db is None:
        raise ConnectionError("Database client is not initialized.")
    return request.app.state.db

async def startup_db_client(app: FastAPI):
    """
    Connects to the MongoDB database on application startup.
    """
    global db_client
    db_url = os.getenv("MONGODB_URL")
    db_name = os.getenv("DB_NAME")

    if not db_url or not db_name:
        raise EnvironmentError("MONGODB_URL and DB_NAME must be set in environment variables.")

    try:
        print("Connecting to MongoDB...")
        db_client = AsyncIOMotorClient(
            db_url,
            tls=True,
            tlsAllowInvalidCertificates=True
        )
        # Ping the server to verify connection
        await db_client.admin.command("ping")
        app.state.db = db_client[db_name]
        print(f"Successfully connected to MongoDB database: {db_name}")
    except Exception as e:
        app.state.db = None
        db_client = None
        print(f"Failed to connect to MongoDB: {e}")
        raise e

async def shutdown_db_client(app: FastAPI):
    """
    Closes the MongoDB connection on application shutdown.
    """
    global db_client
    if db_client is not None:
        print("Closing MongoDB connection...")
        db_client.close()
        db_client = None
        app.state.db = None
        print("MongoDB connection closed.")
