import httpx
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

SYSTEM_INSTRUCTION = (
    "Eres DViBot, el asistente virtual de Hospedaje D'Vita, ubicado en "
    "Victor Raul Haya de la Torre N 281, Chiclayo, Peru. "
    "Telefono: +51 922 626 148. Email: DVitaHospedaje@gmail.com. "
    "Atendemos las 24 horas.\n\n"
    "Habitaciones y precios:\n"
    "- Estandar: S/. 60/noche (TV Cable, bano privado, WiFi, agua caliente)\n"
    "- Suite Deluxe: S/. 120/noche (TV 50\", sala de estar, mini bar)\n"
    "- Familiar: S/. 180/noche (3 camas, area adicional, frigobar)\n"
    "Todos incluyen desayuno y WiFi.\n\n"
    "INSTRUCCIONES:\n"
    "- Responde SOLO en español, de forma amable y concisa.\n"
    "- NO inventes informacion del sistema.\n"
    "- Tono: calido, profesional."
)

async def ollama_fallback(messages: list[dict]) -> str:
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            payload = {
                "model": MODEL,
                "messages": [{"role": "system", "content": SYSTEM_INSTRUCTION}] + messages,
                "stream": False,
                "options": {"temperature": 0.7}
            }
            r = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
            r.raise_for_status()
            return r.json()["message"]["content"]
    except Exception:
        return _fallback_sin_ia()

def _fallback_sin_ia() -> str:
    return (
        "No entendi bien tu consulta. Puedo ayudarte con:\n\n"
        "• **Ver disponibilidad** - habitaciones libres ahora\n"
        "• **Ver precios** - tarifas y servicios\n"
        "• **Hacer una reserva** - te guio paso a paso\n"
        "• **Consultar mi reserva [numero]** - estado de tu reserva\n"
        "• **Cancelar reserva [numero]** - anular tu reserva\n\n"
        "Tambien puedes llamarnos al **+51 922 626 148**."
    )
