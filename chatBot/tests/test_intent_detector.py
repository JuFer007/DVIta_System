from intent_detector import (
    es_saludo,
    es_despedida,
    es_agradecimiento,
    es_confirmacion,
    es_cancelacion,
    es_dni_valido,
    extraer_dni,
    extraer_numero,
    detect_intent,
)


def test_saludo():
    assert es_saludo("Hola")
    assert es_saludo("Buenos días")
    assert es_saludo("Buenas tardes")
    assert es_saludo("Hey, qué tal")
    assert not es_saludo("Reservar habitación")


def test_despedida():
    assert es_despedida("Chau")
    assert es_despedida("Adiós")
    assert es_despedida("Hasta luego")
    assert es_despedida("Nos vemos")
    assert not es_despedida("Hola")


def test_agradecimiento():
    assert es_agradecimiento("Gracias")
    assert es_agradecimiento("Muchas gracias")
    assert es_agradecimiento("Te agradezco mucho")
    assert not es_agradecimiento("Adiós")


def test_confirmacion():
    assert es_confirmacion("Sí")
    assert es_confirmacion("Claro")
    assert es_confirmacion("Ok")
    assert es_confirmacion("De acuerdo")
    assert not es_confirmacion("No")


def test_cancelacion():
    assert es_cancelacion("No")
    assert es_cancelacion("Cancelar")
    assert es_cancelacion("Mejor no")
    assert es_cancelacion("Salir")
    assert not es_cancelacion("Sí")


def test_dni_valido():
    assert es_dni_valido("12345678")
    assert not es_dni_valido("1234")
    assert not es_dni_valido("abcdefgh")
    assert not es_dni_valido("")


def test_extraer_dni():
    assert extraer_dni("Mi DNI es 12345678") == "12345678"
    assert extraer_dni("12345678") == "12345678"
    assert extraer_dni("Hola") is None


def test_extraer_numero():
    assert extraer_numero("3 personas") == 3
    assert extraer_numero("Habitación 101") == 101
    assert extraer_numero("Sin número") is None


def test_detect_intent_reserva():
    assert detect_intent("Quiero reservar una habitación") == "crear_reserva"
    assert detect_intent("Necesito una habitación") == "crear_reserva"
    assert detect_intent("Me interesa una habitación") == "crear_reserva"


def test_detect_intent_disponibilidad():
    assert detect_intent("Hay habitaciones disponibles?") == "disponibilidad"
    assert detect_intent("Qué habitaciones tienen?") == "disponibilidad"
    assert detect_intent("Ver habitaciones") == "disponibilidad"


def test_detect_intent_precios():
    assert detect_intent("Cuánto cuesta?") == "precios"
    assert detect_intent("Cuál es el precio?") == "precios"
    assert detect_intent("Tarifas de habitaciones") == "precios"


def test_detect_intent_cancelar():
    assert detect_intent("Cancelar mi reserva") == "cancelar_reserva"
    assert detect_intent("Anular reserva") == "cancelar_reserva"


def test_detect_intent_menu():
    assert detect_intent("Menú") == "menu"
    assert detect_intent("Qué puedo hacer?") == "menu"
    assert detect_intent("Opciones") == "menu"


def test_detect_intent_contacto():
    assert detect_intent("Cuál es su teléfono?") == "contacto"
    assert detect_intent("Dónde están ubicados?") == "contacto"
    assert detect_intent("Dirección") == "contacto"


def test_detect_intent_servicios():
    assert detect_intent("Qué servicios ofrecen?") == "servicios"
    assert detect_intent("Hay desayuno?") == "servicios"
    assert detect_intent("Tiene estacionamiento?") == "servicios"


def test_detect_intent_ayuda():
    assert detect_intent("Ayuda") == "ayuda"
    assert detect_intent("Qué puedes hacer?") == "ayuda"
    assert detect_intent("No entiendo") == "ayuda"


def test_detect_intent_buscar_reserva():
    assert detect_intent("Consultar mi reserva") == "buscar_reserva"
    assert detect_intent("Mis reservas") == "buscar_reserva"
    assert detect_intent("Cómo está mi reserva?") == "buscar_reserva"


def test_detect_intent_modificar():
    assert detect_intent("Cambiar mi reserva") == "modificar_reserva"
    assert detect_intent("Modificar fecha") == "modificar_reserva"


def test_detect_intent_none():
    assert detect_intent("") is None
    assert detect_intent(None) is None
    assert detect_intent("   ") is None
