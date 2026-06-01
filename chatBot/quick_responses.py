QUICK_RESPONSES: dict[str, str] = {
    "saludo": (
        "¡Hola! Soy **DViBot**, el asistente inteligente de Hospedaje D'Vita.\n\n"
        "Puedo ayudarte con:\n"
        "• Consultar disponibilidad de habitaciones\n"
        "• Ver precios y servicios\n"
        "• Hacer o consultar una reserva\n"
        "• Cancelar tu reserva\n"
        "• Informacion de contacto y ubicacion\n\n"
        "¿En que te puedo ayudar hoy?"
    ),
    "despedida": (
        "¡Hasta luego! Fue un placer atenderte. "
        "Si necesitas algo mas, no dudes en escribirme."
    ),
    "gracias": (
        "¡Con mucho gusto! ¿Hay algo mas en lo que pueda ayudarte?"
    ),
    "horario": (
        "Hospedaje D'Vita atiende **las 24 horas, los 7 dias de la semana**. "
        "Siempre tenemos personal en recepcion para asistirte."
    ),
    "ubicacion": (
        "Estamos en **Victor Raul Haya de la Torre N 281, Chiclayo, Peru**.\n\n"
        "¿Necesitas ayuda con algo mas?"
    ),
    "contacto": (
        "Puedes contactarnos por:\n\n"
        "• Telefono / WhatsApp: **+51 922 626 148**\n"
        "• Correo: **DVitaHospedaje@gmail.com**\n"
        "• Direccion: Victor Raul Haya de la Torre N 281, Chiclayo"
    ),
    "servicios": (
        "Todos nuestros huespedes disfrutan de:\n\n"
        "• **Desayuno incluido** - desayuno completo a la peruana\n"
        "• **WiFi de alta velocidad** en habitaciones y areas comunes\n"
        "• **Estacionamiento techado** gratuito\n"
        "• **Seguridad 24/7** con personal y camaras\n\n"
        "¿Deseas ver disponibilidad o hacer una reserva?"
    ),
}

def get_quick_response(intent_key: str) -> str:
    return QUICK_RESPONSES.get(intent_key, "¿En que puedo ayudarte?")
