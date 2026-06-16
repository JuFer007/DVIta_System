import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path)

from models import ChatRequest, ChatResponse
from agent import chat
from conversation_context import clear_session

app = FastAPI(title="DViBot - Chatbot D'Vita", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://frontend",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

_sessions: dict[str, list[dict]] = {}
MAX_HISTORY = 40

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())

    if not req.message or not req.message.strip():
        return ChatResponse(
            reply="Hola! Soy DViBot. Escribe **menu** para ver las opciones disponibles.",
            session_id=session_id,
        )

    if session_id not in _sessions:
        _sessions[session_id] = []

    _sessions[session_id].append({"role": "user", "content": req.message.strip()})

    try:
        reply = await chat(_sessions[session_id], session_id=session_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if reply:
        _sessions[session_id].append({"role": "assistant", "content": reply})

    if len(_sessions[session_id]) > MAX_HISTORY:
        _sessions[session_id] = _sessions[session_id][-MAX_HISTORY:]

    return ChatResponse(reply=reply, session_id=session_id)

def clear_session_data(session_id: str):
    _sessions.pop(session_id, None)
    clear_session(session_id)

@app.delete("/chat/{session_id}")
async def clear_chat(session_id: str):
    clear_session_data(session_id)
    return {"ok": True}

@app.get("/health")
async def health():
    return {"status": "ok", "sessions": len(_sessions)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
