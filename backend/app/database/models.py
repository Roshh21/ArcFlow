from pydantic import BaseModel, Field
from typing import List, Optional

# -------------------
# Story Models
# -------------------

class Choice(BaseModel):
    text: str = Field(..., description="The text of the choice.")

class StoryChapter(BaseModel):
    text: str = Field(..., description="The generated story text for this chapter.")
    choices: Optional[List[Choice]] = Field(default_factory=list, description="Branching choices for this chapter.")

class Story(BaseModel):
    story_id: str = Field(..., description="Unique ID for the story.")
    user_id: str = Field(..., description="The ID of the user who owns this story.")
    title: Optional[str] = Field(default="Untitled Story", description="Title of the story.")
    genre: Optional[str] = Field(default="", description="Genre of the story.")
    mood: Optional[str] = Field(default="", description="Mood of the story.")
    chapters: List[StoryChapter] = Field(default_factory=list, description="List of story chapters.")
    active: bool = Field(default=True, description="Whether the story is ongoing or saved.")

# -------------------
# User Models
# -------------------

class User(BaseModel):
    user_id: str = Field(..., description="Unique ID of the user.")
    username: str = Field(..., min_length=3, description="User's unique username.")
    hashed_password: str = Field(..., min_length=6, description="User's hashed password.")
    story_history: List[str] = Field(default_factory=list, description="List of story IDs owned by the user.")

class UserAuth(BaseModel):
    username: str
    password: str
