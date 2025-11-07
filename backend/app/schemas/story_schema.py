from pydantic import BaseModel, Field
from typing import List

class Choice(BaseModel):
    """
    Pydantic model for a single branching choice in a story.
    This will be embedded within a StoryChapter.
    """
    text: str = Field(..., description="The text of the choice.")

class StoryChapter(BaseModel):
    """
    Pydantic model for a single chapter of the story.
    This includes the generated text and the available choices.
    """
    text: str = Field(..., description="The generated story text for this chapter.")
    choices: List[Choice] = Field(..., description="A list of branching choices for the user.")

class Story(BaseModel):
    """
    Pydantic model representing a complete story document.
    This will be saved in the MongoDB 'stories' collection.
    """
    user_id: str = Field(..., description="The ID of the user who owns this story.")
    title: str = Field(..., description="The title of the story.")
    genre: str = Field(..., description="The genre of the story.")
    mood: str = Field(..., description="The mood of the story.")
    chapters: List[StoryChapter] = Field(..., description="A list of story chapters.")
    
class User(BaseModel):
    """
    Pydantic model for a user document.
    This will be saved in the MongoDB 'users' collection.
    """
    username: str = Field(..., min_length=3, description="The user's unique username.")
    hashed_password: str = Field(..., description="The user's hashed password.")
    stories: List[str] = Field([], description="A list of story IDs owned by the user.")

class UserAuth(BaseModel):
    """
    Pydantic model for user authentication.
    Used for signup and login requests.
    """
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)

class StoryPrompt(BaseModel):
    """
    Pydantic model for the user's custom story prompt.
    """
    prompt: str = Field(..., description="The initial prompt from the user.")

class AIStartDetails(BaseModel):
    """
    Pydantic model for the AI-start story details.
    """
    mood: str = Field(..., description="The desired mood for the story.")
    genre: str = Field(..., description="The desired genre for the story.")