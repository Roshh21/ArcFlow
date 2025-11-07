import asyncio
import google.generativeai as genai
import os
import re

# --- Configure Gemini API ---
try:
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    if not os.environ.get("GEMINI_API_KEY"):
        print("[WARNING] GEMINI_API_KEY environment variable not set. API calls may fail.")
except Exception as e:
    print(f"[ERROR] Failed to configure Gemini API: {e}")

# --- Core generation functions using Gemini ---
MODEL_NAME = "gemini-2.0-flash"  # Changed to the high-throughput model

def generate_story(prompt: str, max_tokens: int = 80) -> str:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        story_prompt = f"You are a creative storyteller. Start this story:\n\n{prompt}\n\nStory: (in max 150 words with dialouges divided into paragraphs)"
        response = model.generate_content(
            story_prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.8,
                top_p=0.95
            )
        )
        return response.text.strip()
    except Exception as e:
        print(f"[AI ERROR] Failed to generate story: {e}")
        return "Failed to generate story."

def generate_with_choices(current_text: str, num_choices: int = 3, max_tokens: int = 30) -> list[str]:
    prompt = (
        f"{current_text}\n\n"
        "You are a creative storyteller. Continue the story by giving exactly 3 distinct options (each option max 50 words) for what happens next.\n"
        "Format them clearly as:\n"
        "Option A: <story continuation>\n"
        "Option B: <story continuation>\n"
        "Option C: <story continuation>\n"
        "Make each option short but clear, and do not add extra text."
    )

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.9,
                top_p=0.9
            )
        )
        text = response.text.strip()

        # Regex to extract options
        pattern = r"Option [A-C]:\s*(.*)"
        choices = re.findall(pattern, text, re.IGNORECASE)
        if not choices or len(choices) < num_choices:
            choices = [f"Option {chr(65+i)}: (error generating)" for i in range(num_choices)]
        return choices[:num_choices]

    except Exception as e:
        print(f"[AI ERROR] Failed to generate choices: {e}")
        return [f"Option {chr(65+i)}: (error generating)" for i in range(num_choices)]

# --- Async wrappers ---
async def generate_story_async(prompt: str, max_tokens: int = 500) -> str:
    return await asyncio.to_thread(generate_story, prompt, max_tokens)

async def generate_with_choices_async(prompt: str, num_choices: int = 3, max_tokens: int = 350) -> list[str]:
    return await asyncio.to_thread(generate_with_choices, prompt, num_choices, max_tokens)

# --- Frontend helper ---
def label_choices(choices: list[str]) -> list[dict]:
    return [{"label": f"Option {chr(65+i)}", "text": text.strip()} for i, text in enumerate(choices)]
