from fastapi import APIRouter, HTTPException, Request, Body
from bson import ObjectId
from datetime import datetime
from app.database.connection import get_database
from app.schemas.story_schema import UserAuth, User, Story, StoryChapter
from app.core.ai_client import generate_story_async, generate_with_choices_async, label_choices

# -------------------
# Routers
# -------------------
auth_router = APIRouter(prefix="/auth", tags=["Auth"])
story_router = APIRouter(prefix="/story", tags=["Story"])

# -------------------
# AUTH ROUTES
# -------------------
@auth_router.post("/signup")
async def signup(request: Request, user: UserAuth = Body(...)):
    db = get_database(request)
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        user_id=str(ObjectId()),
        username=user.username,
        password=user.password,  # ⚠️ Hash in production
        story_history=[]
    )
    await db.users.insert_one(new_user.model_dump(by_alias=True))
    return {"message": "User created successfully", "user_id": new_user.user_id}


@auth_router.post("/login")
async def login(request: Request, user: UserAuth = Body(...)):
    db = get_database(request)
    existing_user = await db.users.find_one({"username": user.username})
    if not existing_user or existing_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": "Login successful", "user_id": existing_user["user_id"]}


# -------------------
# STORY ROUTES
# -------------------
@story_router.post("/start")
async def start_story(request: Request, user_id: str, prompt: str = "", genre: str = "", mood: str = ""):
    db = get_database(request)
    if not prompt and not genre:
        raise HTTPException(status_code=400, detail="Provide prompt or genre for story start.")

    # Use default genre/mood if not provided
    genre = genre or "General"
    mood = mood or "Neutral"

    initial_prompt = prompt or f"Start a {genre} story with a {mood} mood."
    chapter_text = await generate_story_async(initial_prompt)
    choices_text = await generate_with_choices_async(chapter_text)
    choices = label_choices(choices_text)

    chapter = StoryChapter(text=chapter_text, choices=choices)
    story = Story(
        story_id=str(ObjectId()),
        user_id=user_id,
        title="Untitled Story",
        genre=genre,
        mood=mood,
        chapters=[chapter],
        active=True,
        last_played=datetime.utcnow()
    )

    await db.stories.insert_one(story.model_dump(by_alias=True))
    await db.users.update_one(
        {"user_id": user_id},
        {"$push": {"story_history": story.story_id}}
    )

    return {"story_id": story.story_id, "chapter": chapter, "choices": choices}


@story_router.post("/continue")
async def continue_story(request: Request, user_id: str, story_id: str, choice_text: str = None, user_text: str = None):
    db = get_database(request)
    story_data = await db.stories.find_one({"story_id": story_id, "user_id": user_id})
    if not story_data:
        raise HTTPException(status_code=404, detail="Story not found.")

    story = Story.model_validate(story_data)
    last_chapter = story.chapters[-1]

    next_prompt = user_text or choice_text or last_chapter.text
    chapter_text = await generate_story_async(next_prompt)
    choices_text = await generate_with_choices_async(chapter_text)
    choices = label_choices(choices_text)

    new_chapter = StoryChapter(text=chapter_text, choices=choices)
    story.chapters.append(new_chapter)

    await db.stories.update_one(
        {"story_id": story_id, "user_id": user_id},
        {"$set": {
            "chapters": [c.model_dump(by_alias=True) for c in story.chapters],
            "last_played": datetime.utcnow()
        }}
    )

    return {"chapter": new_chapter, "choices": choices}


@story_router.post("/save")
async def save_story(request: Request, user_id: str, story_id: str):
    db = get_database(request)
    result = await db.stories.update_one(
        {"story_id": story_id, "user_id": user_id},
        {"$set": {"active": False, "last_played": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Story not found or already saved.")
    return {"message": "Story saved successfully."}


@story_router.get("/history")
async def get_story_history(request: Request, user_id: str):
    db = get_database(request)
    stories = await db.stories.find(
        {"user_id": user_id, "active": False},
        {"_id": 0, "story_id": 1, "title": 1, "genre": 1, "mood": 1, "last_played": 1}
    ).to_list(length=100)
    return {"history": stories}


# GET story
@story_router.get("/get")
async def get_story(request: Request, user_id: str, story_id: str):
    db = get_database(request)
    story_data = await db.stories.find_one({"story_id": story_id, "user_id": user_id})
    if not story_data:
        raise HTTPException(status_code=404, detail="Story not found")
    return story_data

# DELETE story
@story_router.delete("/delete")
async def delete_story(request: Request, payload: dict = Body(...)):
    user_id = payload.get("user_id")
    story_id = payload.get("story_id")
    if not user_id or not story_id:
        raise HTTPException(status_code=400, detail="user_id and story_id required")

    db = get_database(request)
    result = await db.stories.delete_one({"story_id": story_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    return {"message": "Story deleted successfully"}
