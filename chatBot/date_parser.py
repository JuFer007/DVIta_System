"""
Parser de fechas en espanol: "manana", "proximo lunes", "15 de junio",
"dentro de 2 dias", "en 3 semanas", etc.
"""
import re
from datetime import date, timedelta
from calendar import monthrange

DIAS = {"lunes": 0, "martes": 1, "miercoles": 2, "miercoles": 2, "jueves": 3,
        "viernes": 4, "sabado": 5, "sabado": 5, "domingo": 6}

MESES = {"enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5,
         "junio": 6, "julio": 7, "agosto": 8, "septiembre": 9, "setiembre": 9,
         "octubre": 10, "noviembre": 11, "diciembre": 12}

def _hoy() -> date:
    return date.today()

def _siguiente_dia_semana(dia_nombre: str, incluir_hoy: bool = False) -> date | None:
    dia = DIAS.get(dia_nombre)
    if dia is None:
        return None
    hoy = _hoy()
    dias_hasta = (dia - hoy.weekday() + 7) % 7
    if not incluir_hoy and dias_hasta == 0:
        dias_hasta = 7
    return hoy + timedelta(days=dias_hasta)

def parsear_fecha(texto: str | None) -> date | None:
    if not texto or not isinstance(texto, str):
        return None
    msg = texto.lower().strip()
    if not msg:
        return None
    hoy = _hoy()
    anio = hoy.year

    if msg in ("pasado manana", "pasado"):
        return hoy + timedelta(days=2)

    if msg in ("hoy", "el dia de hoy"):
        return hoy

    if msg in ("manana", "el dia de manana", "el dia de mañana", "mañana"):
        return hoy + timedelta(days=1)

    m = re.search(r"(?:dentro\s+de|en|de\s+aqui\s+a)\s+(\d+)\s+(d[ií]as?|semanas?|mes(?:es)?)", msg)
    if m:
        cantidad = int(m.group(1))
        unidad = m.group(2).lower()
        if unidad.startswith("d"):
            return hoy + timedelta(days=cantidad)
        elif unidad.startswith("s"):
            return hoy + timedelta(weeks=cantidad)
        elif unidad.startswith("m"):
            mes = hoy.month + cantidad
            y = anio + (mes - 1) // 12
            m = ((mes - 1) % 12) + 1
            dia = min(hoy.day, monthrange(y, m)[1])
            return date(y, m, dia)

    if "fin de semana" in msg:
        m = re.search(r"pr[oó]ximo\s+fin\s+de\s+semana", msg)
        if m:
            viernes = _siguiente_dia_semana("viernes")
            if viernes:
                return viernes

    m = re.search(r"pr[oó]xim[oa]\s*(?:semana\s+)?(\w+)", msg)
    if m:
        dia = m.group(1)
        if dia in DIAS:
            return _siguiente_dia_semana(dia)

    m = re.search(r"este\s+(\w+)", msg)
    if m:
        dia = m.group(1)
        if dia in DIAS:
            return _siguiente_dia_semana(dia)

    m = re.search(r"(\w+)\s+que\s+viene", msg)
    if m:
        dia = m.group(1)
        if dia in DIAS:
            return _siguiente_dia_semana(dia)

    if "proxima semana" in msg:
        return hoy + timedelta(days=7)

    if "proximo mes" in msg:
        m = hoy.month + 1
        y = anio if m <= 12 else anio + 1
        m = ((m - 1) % 12) + 1
        return date(y, m, 1)

    m = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", msg)
    if m:
        try:
            return date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            pass

    m = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", msg)
    if m:
        try:
            return date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
        except ValueError:
            pass

    m = re.search(r"(\d{1,2})\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?", msg)
    if m:
        dia = int(m.group(1))
        mes = MESES.get(m.group(2))
        anio = int(m.group(3)) if m.group(3) else anio
        if mes:
            try:
                return date(anio, mes, dia)
            except ValueError:
                pass

    return None

def parsear_rango(texto: str | None) -> tuple[date | None, date | None]:
    if not texto or not isinstance(texto, str):
        return None, None
    msg = texto.lower()

    m = re.search(r"(?:del|desde)\s+(.+?)\s+(?:al|hasta)\s+(.+)", msg)
    if m:
        inicio = parsear_fecha(m.group(1).strip())
        fin = parsear_fecha(m.group(2).strip())
        return inicio, fin

    m = re.search(r"por\s+(\d+)\s+(?:noche|d[ií]a)", msg)
    if m:
        noches = int(m.group(1))
        resto = re.sub(r"por\s+\d+\s+(?:noche|d[ií]a)", "", msg)
        f = parsear_fecha(resto.strip())
        if f:
            return f, f + timedelta(days=noches)
        return None, None

    return None, None
