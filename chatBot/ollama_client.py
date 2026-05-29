import httpx
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
TIMEOUT = 30

def build_system_prompt(ctx=None) -> str:
    extra = ""
    if ctx:
        extra = f"\n\nCONTEXTO ACTUAL:\n{ctx.to_llm_context()}\n"

    return (
        "Eres DViBot, el recepcionista virtual de Hospedaje D'Vita en Chiclayo, Peru.\n"
        "Hablas de forma natural y amigable, como un recepcionista de verdad.\n"
        "Mantienes el hilo de la conversacion y respondes en espanol.\n\n"
        "INFORMACION DEL HOTEL:\n"
        "- Telefono: +51 922 626 148 | Email: DVitaHospedaje@gmail.com\n"
        "- Direccion: Victor Raul Haya de la Torre N 281, Chiclayo\n"
        "- Atendemos 24/7.\n\n"
        "PRECIOS POR NOCHE:\n"
        "- Estandar: S/. 60 (TV Cable, bano privado, WiFi, agua caliente)\n"
        "- Suite Deluxe: S/. 120 (TV 50, sala de estar, mini bar)\n"
        "- Familiar: S/. 180 (3 camas, area adicional, frigobar)\n"
        "- Todos incluyen desayuno y WiFi.\n\n"
        "REGLAS:\n"
        "- Responde en espanol, natural como una conversacion real.\n"
        "- Si el cliente pregunta por precios, servicios o contacto, responde directamente.\n"
        "- Si quiere hacer una reserva, cancelar o ver sus reservas, pide su DNI.\n"
        "- No inventes datos del sistema (reservas, clientes, habitaciones disponibles).\n"
        "- Si no sabes algo o necesitas mas informacion, sugiere llamar al +51 922 626 148.\n"
        "- IMPORTANTE: Antes de confirmar una accion critica (reserva, cancelacion), "
        "verifica siempre con el usuario que los datos sean correctos.\n"
        "- Si el usuario parece confundido, ofrecele escribir **menu** para ver las opciones disponibles."
        f"{extra}"
    )

CLASIFICADOR_PROMPT = (
    "Eres un clasificador de intenciones para un hotel. "
    "Clasifica el mensaje en UNA de estas categorias. "
    "Si no coincide con ninguna, responde SOLO 'ninguna'.\n\n"
    "Categorias:\n"
    "- saludo: saludar, preguntar como estas\n"
    "- disponibilidad: preguntar por habitaciones libres, disponibilidad\n"
    "- precios: preguntar por precios, tarifas, costos\n"
    "- crear_reserva: querer hacer una reserva, pedir habitacion\n"
    "- cancelar_reserva: querer cancelar una reserva\n"
    "- buscar_reserva: consultar estado de reservas existentes\n"
    "- contacto: pedir telefono, direccion, ubicacion\n"
    "- servicios: preguntar por desayuno, wifi, estacionamiento, etc.\n"
    "- menu: pedir el menu de opciones, preguntar que puede hacer el sistema\n"
    "- ayuda: pedir ayuda, no entender como usar el sistema\n"
    "- salir: querer salir, terminar la conversacion\n\n"
    "Ejemplos:\n"
    "Mensaje: 'hola como estas' -> saludo\n"
    "Mensaje: 'que precio tienen las habitaciones' -> precios\n"
    "Mensaje: 'quiero una habitacion para este fin de semana' -> crear_reserva\n"
    "Mensaje: 'cancela mi reserva por favor' -> cancelar_reserva\n"
    "Mensaje: 'dime la direccion' -> contacto\n"
    "Mensaje: 'incluye desayuno' -> servicios\n"
    "Mensaje: 'que opciones tienes' -> menu\n"
    "Mensaje: 'no se que hacer' -> ayuda\n"
    "Mensaje: 'quiero salir' -> salir\n"
    "Mensaje: 'como se llama el presidente' -> ninguna\n"
    "Mensaje: 'cuentame un chiste' -> ninguna\n\n"
    "Mensaje: {msg}\n"
    "Categoria:"
)

_MAPEO = {
    "disponibilidad": "disponibilidad", "disponible": "disponibilidad",
    "precios": "precios", "precio": "precios",
    "crear_reserva": "crear_reserva", "reservar": "crear_reserva",
    "cancelar_reserva": "cancelar_reserva", "cancelar reserva": "cancelar_reserva",
    "anular": "cancelar_reserva", "cancelar": "cancelar_reserva",
    "buscar_reserva": "buscar_reserva", "mis reservas": "buscar_reserva",
    "contacto": "contacto", "telefono": "contacto",
    "servicios": "servicios", "servicio": "servicios",
    "saludo": "saludo", "saludos": "saludo",
    "menu": "menu", "menú": "menu",
    "ayuda": "ayuda", "help": "ayuda",
    "salir": "salir",
}

async def classify_intent(message: str) -> str | None:
    if not message or not message.strip():
        return None
    msg = message.strip()
    prompt = CLASIFICADOR_PROMPT.format(msg=msg)
    async with httpx.AsyncClient(timeout=15) as client:
        payload = {
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            "options": {"temperature": 0}
        }
        try:
            r = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
            r.raise_for_status()
            reply = r.json()["message"]["content"].strip().lower().rstrip(".")
            if reply in ("ninguna", "ninguno", "ningun", "nada", "otro"):
                return None
            return _MAPEO.get(reply.replace(" ", "_"))
        except Exception:
            return None

async def chat(messages: list[dict], ctx=None) -> str:
    if not messages:
        return ""
    system_prompt = build_system_prompt(ctx)
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        payload = {
            "model": MODEL,
            "messages": [{"role": "system", "content": system_prompt}] + messages,
            "stream": False,
            "options": {"temperature": 0.5}
        }
        try:
            r = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
            r.raise_for_status()
            return r.json()["message"]["content"]
        except Exception:
            return ""
