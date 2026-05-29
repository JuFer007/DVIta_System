from pydantic import BaseModel, Field
from typing import Optional

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="Mensaje del usuario")
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str
