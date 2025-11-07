from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

# Import your Gemini AI client
from app.core.ai_client import generate_story_async, generate_with_choices_async, label_choices

app = FastAPI()

# -----------------------
# CORS
# -----------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# In-memory storage
# -----------------------
USERS = {}   # {username: {"user_id": ..., "password": ...}}
STORIES = {} # {story_id: [chapters]}
HISTORY = {} # {story_id: {"title": ..., "last_played": ..., "chapters": [...]}}

# -----------------------
# Auth Router
# -----------------------
auth_router = APIRouter(tags=["Auth"])

class UserAuth(BaseModel):
    username: str
    password: str

@auth_router.post("/api/auth/signup")
async def signup(data: UserAuth):
    """Register a new user"""
    if data.username in USERS:
        return {"error": "User already exists"}
    
    user_id = str(uuid.uuid4())
    USERS[data.username] = {"user_id": user_id, "password": data.password}
    return {"message": "User created successfully", "user_id": user_id}

@auth_router.post("/api/auth/login")
async def login(data: UserAuth):
    """Login with username/password"""
    user = USERS.get(data.username)
    if not user or user["password"] != data.password:
        return {"error": "Invalid credentials"}
    return {"message": "Login successful", "user_id": user["user_id"]}

app.include_router(auth_router)

# -----------------------
# Story Router
# -----------------------
story_router = APIRouter(tags=["Story"])

class StartStoryRequest(BaseModel):
    player_name: Optional[str] = None
    genre: Optional[str] = None
    mood: Optional[str] = None

class ContinueStoryRequest(BaseModel):
    story_id: str
    choice_text: Optional[str] = None
    user_text: Optional[str] = None

class SaveStoryRequest(BaseModel):
    story_id: str

# ---------- Start user story ----------
@story_router.post("/api/story/start")
async def start_story(data: StartStoryRequest):
    try:
        story_id = str(uuid.uuid4())
        prompt = f"{data.player_name} begins an adventure." if data.player_name else "The story begins..."
        chapter_text = await generate_story_async(prompt)
        choices_raw = await generate_with_choices_async(chapter_text)
        choices = label_choices(choices_raw)
        STORIES[story_id] = [chapter_text]

        return {
            "story_id": story_id,
            "chapter": {"text": chapter_text, "choices": choices},
            "choices": choices,
        }

    except Exception as e:
        print("[ERROR] Failed to start story:", e)
        return {"error": str(e)}

# ---------- Start AI story ----------
@story_router.post("/api/story/ai-start")
async def ai_start_story(data: StartStoryRequest):
    try:
        story_id = str(uuid.uuid4())
        prompt = f"Genre: {data.genre}. Mood: {data.mood}. Start the story."
        chapter_text = await generate_story_async(prompt)
        choices_raw = await generate_with_choices_async(chapter_text)
        choices = label_choices(choices_raw)
        STORIES[story_id] = [chapter_text]

        return {
            "story_id": story_id,
            "chapter": {"text": chapter_text, "choices": choices},
            "choices": choices,
        }

    except Exception as e:
        print("[ERROR] Failed to start AI story:", e)
        return {"error": str(e)}

# ---------- Continue story ----------
@story_router.post("/api/story/continue")
async def continue_story(data: ContinueStoryRequest):
    try:
        if data.story_id not in STORIES:
            return {"error": "Story not found"}
        
        previous_story = "\n".join(STORIES[data.story_id])
        prompt = ""
        if data.choice_text:
            prompt += f"Choice taken: {data.choice_text}. "
        if data.user_text:
            prompt += f"User added: {data.user_text}. "

        chapter_text = await generate_story_async(prompt + "\n" + previous_story)
        choices_raw = await generate_with_choices_async(chapter_text)
        choices = label_choices(choices_raw)
        STORIES[data.story_id].append(chapter_text)

        return {
            "story_id": data.story_id,
            "chapter": {"text": chapter_text, "choices": choices},
            "choices": choices,
        }

    except Exception as e:
        print("[ERROR] Failed to continue story:", e)
        return {"error": str(e)}

# ---------- Save story ----------
@story_router.post("/api/story/save")
async def save_story(data: SaveStoryRequest):
    try:
        if data.story_id not in STORIES:
            return {"error": "Story not found"}
        
        HISTORY[data.story_id] = {
            "title": f"Story {data.story_id[:6]}",
            "last_played": datetime.utcnow().strftime("%B %d, %Y"),
            "chapters": STORIES[data.story_id].copy(),
        }
        return {"message": "Story saved successfully", "story_id": data.story_id}

    except Exception as e:
        print("[ERROR] Failed to save story:", e)
        return {"error": str(e)}

# ---------- Get history ----------
@story_router.get("/api/story/history")
async def get_history():
    try:
        return {"history": [
            {"story_id": sid, "title": info["title"], "last_played": info["last_played"]}
            for sid, info in HISTORY.items()
        ]}
    except Exception as e:
        print("[ERROR] Failed to fetch history:", e)
        return {"error": str(e)}

# ---------- Delete story from history ----------
@story_router.delete("/api/story/delete/{story_id}")
async def delete_story(story_id: str):
    try:
        if story_id not in HISTORY:
            return {"error": "Story not found in history"}
        del HISTORY[story_id]
        return {"message": "Story deleted", "story_id": story_id}
    except Exception as e:
        print("[ERROR] Failed to delete story:", e)
        return {"error": str(e)}

app.include_router(story_router)