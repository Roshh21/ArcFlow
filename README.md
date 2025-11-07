#  Arcflow

**Arcflow** is an interactive storytelling web app powered by **GenAI**, where users can either start their own story or co-create one with AI.  
You can choose a **genre** and **mood**, get AI-generated story openings and branching paths, or continue your own storyline.  

---

##  Features

-  **Two creative modes**
  - **Start with AI** – Pick genre & mood, AI begins the story with multiple branching options.  
  - **Start your story** – You write the beginning, and AI suggests 3 unique continuations.
-  **AI-powered story generation** using **Google Gemini API**
-  **MongoDB** for user & story storage
-  **User authentication**
-  **Interactive branching UI**
-  **React (Frontend)** + **Python FastAPI (Backend)** architecture

---

##  Tech Stack

| Area | Technology |
|------|-------------|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Backend | Python + FastAPI |
| AI | Gemini API (Google Generative AI) |
| Database | MongoDB (Atlas or local) |
| Auth | JWT-based authentication |
| Deployment | (Optional) Vercel / Render / Railway |

---


##  Getting Started

### 1. Install Requirements
```bash
pip install -r requirements.txt
```

### 2. Setup Backend (FastAPI)
```
cd backend
python -m venv venv
source venv/bin/activate        
uvicorn main:app --reload
```


### 3️. Setup Frontend (React + Vite)
```
cd frontend
npm install
npm run dev
```

### 4. Export Gemini API key
```
export GEMINI_API_KEY="AIxxxx.."
```

### AI Story Generation (Gemini)

Arcflow uses Google Gemini API to:

1. Generate story openings

2. Suggest branching paths

3. Continue user-written stories

4. Each AI response creates a dynamic, branching narrative saved to MongoDB for each user session.