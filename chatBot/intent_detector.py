import re

def _validar(msg: str | None) -> str | None:
    if not msg or not isinstance(msg, str):
        return None
    stripped = msg.strip()
    return stripped if stripped else None

def es_saludo(message: str) -> bool:
    m = _validar(message)
    if not m:
        return False
    return bool(re.search(
        r"\b(hola|buenos?\s*(d[ií]as?|tardes?|noches?)|hey|saludos?|buenas?|q[eé]\s+tal|c[oó]mo\s+est[áa]s?|que\s+tal)\b",
        m.lower()
    ))

def es_despedida(message: str) -> bool:
    m = _validar(message)
    if not m:
        return False
    return bool(re.search(
        r"\b(chau?|adi[oó]s|hasta\s+(luego|pronto|siempre)|nos\s+vemos|gracias\s+por\s+tu\s+ayuda|que\s+tengas|bye)\b",
        m.lower()
    ))

def es_agradecimiento(message: str) -> bool:
    m = _validar(message)
    if not m:
        return False
    return bool(re.search(
        r"\b(gracias?|muchas\s+gracias|te\s+agradezco|agradecid[ao]|thanks)\b",
        m.lower()
    ))

def es_no_se(message: str) -> bool:
    m = _validar(message)
    if not m:
        return False
    return bool(re.search(
        r"(no\s+(s[eé]|tengo\s+idea|recuerdo|me\s+acuerdo|conozco|entiendo)|ns[ea]|no\s+lo\s+s[eé])",
        m.lower()
    ))

def es_dni_valido(message: str) -> bool:
    m = _validar(message)
    if not m:
        return False
    return bool(re.match(r"^\d{8}$", m))

def extraer_dni(message: str) -> str | None:
    m = _validar(message)
    if not m:
        return None
    match = re.search(r"\b(\d{8})\b", m)
    return match.group(1) if match else None

def extraer_numero(message: str) -> int | None:
    m = _validar(message)
    if not m:
        return None
    nums = re.findall(r"\d+", m)
    return int(nums[0]) if nums else None

def es_confirmacion(message: str) -> bool:
    m = _validar(message)
    if not m:
        return False
    return bool(re.search(
        r"\b(s[ií]|s[eé]|ok|claro|confirmar?|adelante|aceptar?|correcto|dale|vamos|h[aá]gale|de\s+acuerdo)\b",
        m.lower()
    ))

def es_cancelacion(message: str) -> bool:
    m = _validar(message)
    if not m:
        return False
    return bool(re.search(
        r"\b(no|cancelar?|abortar?|salir|nada|omitir|parar|mejor\s+no|olv[ií]dalo|d[eé]jalo)\b",
        m.lower()
    ))

def _normalizar(text: str) -> str:
    accents = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
               'ü': 'u', 'ñ': 'n'}
    return ''.join(accents.get(c, c) for c in text)

def detect_intent(message: str) -> str | None:
    m = _validar(message)
    if not m:
        return None
    msg = _normalizar(m.lower())
    patterns = {
        "menu": [
            r"\b(men[uú]|menu|opciones|inicio|que\s+puedo\s+hacer|mostrar\s+menu|mu[eé]strame\s+el\s+menu|panel|inicio)\b",
        ],
        "volver": [
            r"\b(volver|atr[aá]s|regresar|anterior|menu\s+principal|principial|retroceder)\b",
        ],
        "salir": [
            r"\b(salir|terminar|finalizar|cerrar|chau)\b",
        ],
        "ayuda": [
            r"\b(ayuda|help|ay[uú]dame|que\s+puedes?\s+hacer|que\s+opciones\s+tengo|no\s+entiendo|como\s+funciona)\b",
        ],
        "disponibilidad": [
            r"disponib",
            r"habitaci[oó]n\s+(libre|disponible|hay)",
            r"hay\s+(cuartos?|habitaciones?|algo\s+libre|disponibilidad)",
            r"ver\s+habitaciones?",
            r"libre\s+hay",
            r"qu[eé]\s+habitaciones?\s+tienen",
            r"cu[aá]les?\s+(est[aá]n|hay)\s+(libres?|disponibles?)",
            r"quier[oe]\s+ver\s+habitaciones?",
            r"que\s+(tiene|tienen|ofrecen)\s+en\s+habitaciones?",
            r"c[oó]mo\s+est[aá]n\s+las\s+habitaciones?",
        ],
        "precios": [
            r"\b(cu[aá]nto\s+(cuesta|vale|cobran?|sale|es|costar[aá])|precio|tarifa|costo|precios)\b",
            r"\bcu[aá]nto\s+est[aá]n\s+las\s+habitaciones?\b",
            r"(precios?|tarifas?)\s+de\s+(las\s+)?habitaciones?",
            r"que\s+(precios?|tarifas?|costos?)\s+tienen",
            r"cuanto\s+es\s+el\s+precio",
        ],
        "cancelar_reserva": [
            r"\b(cancelar|anular|eliminar|dar\s+de\s+baja)\s+(mi\s+|la\s+|una\s+)?reserva\b",
            r"\b(quiero|cancelar?|necesito)\s+cancelar\b",
            r"cancela\w*\s+(mi\s+)?reserva",
            r"eliminar\s+reserva",
        ],
        "modificar_reserva": [
            r"\b(cambiar|modificar|extender|reducir|mover|editar|actualizar)\s+(mi\s+|la\s+)?reserva\b",
            r"\b(cambiar|modificar|editar)\s+(fecha|habitaci[oó]n|d[ií]a|estad[ií]a)\b",
            r"cambio\s+de\s+reserva",
            r"quier[oe]\s+(cambiar|modificar)\s+",
            r"necesit[oa]\s+(cambiar|modificar)\s+",
            r"extender\s+(mi\s+)?estad[ií]a",
            r"reducir\s+(mi\s+)?estad[ií]a",
        ],
        "crear_reserva": [
            r"\b(quier[oe]\s+(reservar|hacer|apartar)|reservar|hacer\s+reserva|crear\s+reserva|nueva\s+reserva)\b",
            r"me\s+interesa\s+(una\s+)?habitaci[oó]n",
            r"(quisiera|querr[ií]a|me\s+gustar[ií]a)\s+(reservar|una\s+habitaci[oó]n|apartar)",
            r"para\s+\d+\s+(personas?|noche)",
            r"quier[oe]\s+(una\s+|apartar\s+)?habitaci[oó]n",
            r"necesit[oa]\s+(una\s+)?habitaci[oó]n",
            r"(puedo\s+)?reservar\s+(una\s+)?habitaci[oó]n",
            r"\bbusc[ao]\s+(una\s+)?habitaci[oó]n",
            r"\b(ando\s+buscando|busco|buscar)\s+(una\s+)?habitaci[oó]n",
        ],
        "buscar_reserva": [
            r"\b(mis\s+reservas?|consultar?\s+(mi\s+)?reserva|estado\s+de\s+mi\s+reserva)\b",
            r"quier[oe]\s+ver\s+(mis\s+)?reservas?",
            r"c[oó]mo\s+est[aá]\s+(mi\s+)?reserva",
            r"tengo\s+(una\s+)?reserva",
            r"ver\s+mis\s+reservas",
            r"que\s+(reservas?|habitaci[oó]n)\s+tengo",
        ],
        "contacto": [
            r"\b(tel[eé]fono|direcci[oó]n|ubicaci[oó]n|contacto|whatsapp|celular|correo|email)\b",
            r"c[oó]mo\s+(contacto|llamo|comunic[oó])",
            r"d[oó]nde\s+(est[aá]n|ubican|queda)",
            r"n[uú]mero\s+de\s+tel[eé]fono",
            r"manda\w*\s+(la\s+)?direcci[oó]n",
        ],
        "servicios": [
            r"\b(servicios?|incluye|desayuno|wifi|estacionamiento|amenities|tv|cable)\b",
            r"qu[eé]\s+(ofrece|incluye|tiene|brinda)",
            r"hay\s+desayuno",
            r"tiene\s+estacionamiento",
            r"incluye\s+desayuno",
        ],
    }
    for intent, p_list in patterns.items():
        for p in p_list:
            if re.search(p, msg, re.IGNORECASE):
                return intent
    return None
