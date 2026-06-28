import pytest


@pytest.fixture
def sample_texts():
    return {
        "saludo": "Hola, buenos días",
        "despedida": "Chau, gracias",
        "agradecimiento": "Muchas gracias por tu ayuda",
        "reserva": "Quiero reservar una habitación",
        "cancelacion": "No, mejor no",
        "disponibilidad": "Hay habitaciones disponibles?",
        "precios": "Cuánto cuesta una habitación?",
        "menu": "Menú de opciones",
        "contacto": "Cuál es su teléfono?",
        "dni_valido": "12345678",
        "dni_invalido": "1234",
        "fecha_manana": "mañana",
        "fecha_hoy": "hoy",
        "fecha_iso": "2024-12-25",
        "fecha_proximo_lunes": "próximo lunes",
        "fecha_dentro_de": "dentro de 3 días",
    }
