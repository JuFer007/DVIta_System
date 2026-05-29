"""
DViBot Test Suite - Runner
Ejecuta 140+ casos de prueba contra el chatbot y genera reporte.
"""
import httpx
import json
import time
import sys
import re
import os
from datetime import datetime

CHAT_URL = "http://localhost:8000/chat"
DNI_REAL = "71374454"
DNI_FAKE = "99999999"
REPORT = []

def t(msg: str, sid: str = None) -> dict:
    """Send one message to chatbot."""
    sid = sid or f"test_{int(time.time()*1000)}"
    try:
        r = httpx.post(CHAT_URL, json={"message": msg, "session_id": sid}, timeout=30)
        data = r.json()
        return {"sid": data["session_id"], "reply": data["reply"], "ok": True}
    except Exception as e:
        return {"sid": sid, "reply": f"[ERROR] {e}", "ok": False}

def identify(sid: str, dni: str = DNI_REAL) -> bool:
    """Identify a user session. Returns True if identified."""
    r = t(dni, sid)
    return "Bienvenido" in r["reply"] or "tengo en el sistema" in r["reply"]

def run_category(name: str, cases: list, needs_dni: bool = False):
    """Run a batch of tests."""
    print(f"\n{'='*60}")
    print(f"  {name}")
    print(f"{'='*60}")

    for i, case in enumerate(cases):
        sid = f"cat_{name.replace(' ','_')}_{i}_{int(time.time())}"

        if needs_dni:
            r1 = t(DNI_REAL, sid)
            if not ("Bienvenido" in r1["reply"] or "tengo" in r1["reply"]):
                r1 = t(DNI_REAL, sid)
                if "registrarte" in r1["reply"] or "registrarte" in r1["reply"].lower():
                    t("no", sid)
                    sid = f"cat_{name.replace(' ','_')}_{i}_{int(time.time())}_v2"
                    r1 = t(DNI_REAL, sid)

        r = t(case, sid)
        reply = r["reply"]
        passed = _eval_response(case, reply)
        status = "PASS" if passed else "CHECK"
        _log(status, i + 1, case, reply)
        time.sleep(0.3)

def run_multi_turn(turns: list, name: str):
    """Run a multi-turn conversation test."""
    print(f"\n{'='*60}")
    print(f"  {name}")
    print(f"{'='*60}")

    sid = f"multi_{name.replace(' ','_')}_{int(time.time())}"

    for i, msg in enumerate(turns):
        r = t(msg, sid)
        reply = r["reply"]
        passed = _eval_response(msg, reply)
        status = "PASS" if passed else "CHECK"
        _log(status, i + 1, f"[Turno {i+1}] {msg[:60]}", reply)
        time.sleep(0.3)

def run_conversation_flow(name: str, turns: list):
    """Run a full conversation flow with session persistence."""
    print(f"\n{'='*60}")
    print(f"  {name}")
    print(f"{'='*60}")

    sid = f"flow_{name.replace(' ','_')}_{int(time.time())}"

    for i, msg in enumerate(turns):
        r = t(msg, sid)
        reply = r["reply"]
        passed = _eval_response(msg, reply)
        status = "PASS" if passed else "CHECK"
        action = ""

        if msg == DNI_REAL and ("Bienvenido" in reply or "tengo" in reply):
            action = "[IDENTIFICADO]"
        elif "menu" in reply.lower() or "MENU" in reply:
            action = "[MENU]"
        elif "reserva" in reply.lower() and "creada" in reply.lower():
            action = "[RESERVA CREADA]"
        elif "cancelada" in reply.lower():
            action = "[CANCELADA]"

        label = f"[Turno {i+1}] {msg[:50]}{' ' + action if action else ''}"
        _log(status, i + 1, label, reply)
        time.sleep(0.5)

def _eval_response(msg: str, reply: str) -> bool:
    """Simple heuristic: response should not be empty or error."""
    r = reply.lower()
    if not r or len(r) < 5:
        return False
    if "error" in r and "llama" in r:
        return False
    return True

def _log(status: str, num: int, msg: str, reply: str):
    line = f"[{status}] #{num}: \"{msg[:70]}\""
    print(f"  {line}")
    reply_short = reply[:140].replace("\n", " ")
    REPORT.append(f"| {status} | {num} | {msg[:80]} | {reply_short} |")

def guardar_report():
    content = "\n".join(REPORT)
    passes = sum(1 for l in REPORT if l.startswith("| PASS"))
    checks = sum(1 for l in REPORT if l.startswith("| CHECK"))
    total = passes + checks
    summary = (
        f"\n\n## RESULTADOS\n\n"
        f"| Resultado | Cantidad |\n"
        f"|-----------|----------|\n"
        f"| **Total** | {total} |\n"
        f"| PASS | {passes} |\n"
        f"| CHECK | {checks} |\n"
        f"| **Fecha** | {datetime.now().strftime('%Y-%m-%d %H:%M')} |\n"
    )

    now = datetime.now().strftime("%Y%m%d_%H%M%S")
    base = os.path.dirname(os.path.abspath(__file__))
    filename = os.path.join(base, f"reporte_{now}.md")
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"# Reporte de Pruebas DViBot\n\n")
        f.write(f"**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        f.write(f"| Resultado | # | Mensaje | Respuesta |\n")
        f.write(f"|-----------|--|---------|-----------|\n")
        for line in REPORT:
            f.write(line + "\n")
        f.write(summary)

    print(f"\n{'='*60}")
    print(f"  Reporte: {filename}")
    print(f"  PASS: {passes}/{total} | CHECK: {checks}/{total}")
    print(f"{'='*60}")

# ================================================================
# TEST DATA
# ================================================================

CAT_1_RESERVAS = [
    "Hola, quiero reservar una habitacion para 2 personas del 15 al 18 de junio.",
    "Necesito una habitacion simple para manana.",
    "Quiero reservar una habitacion matrimonial por 3 noches.",
    "Deseo hospedarme desde el 20 de julio hasta el 25 de julio.",
    "Busco una habitacion doble con vista al mar.",
    "Necesito reservar 2 habitaciones para este fin de semana.",
    "Quiero una habitacion para una sola persona.",
    "Necesito una habitacion familiar para 5 personas.",
    "Deseo reservar una suite para el proximo lunes.",
    "Quiero hospedarme por una semana completa.",
]

CAT_2_FALTA_INFO = [
    "Quiero reservar una habitacion.",
    "Necesito una suite.",
    "Deseo hospedarme.",
    "Quiero una habitacion doble.",
    "Necesito una reserva para mi familia.",
    "Quiero quedarme varios dias.",
    "Busco disponibilidad.",
    "Quiero reservar para julio.",
    "Necesito una habitacion urgente.",
    "Deseo una habitacion comoda.",
]

CAT_3_FECHAS_INVALIDAS = [
    "Quiero reservar del 30 de febrero al 5 de marzo.",
    "Deseo hospedarme del 15 al 10 de junio.",
    "Necesito una habitacion para ayer.",
    "Quiero reservar una habitacion para el 32 de diciembre.",
    "Deseo hospedarme desde el 0 de mayo.",
    "Quiero reservar del 10/15/2026 al 12/15/2026.",
    "Necesito una habitacion para febrero 29 del proximo anio.",
    "Quiero una reserva desde manana hasta ayer.",
    "Deseo hospedarme del 13 al 13 de agosto.",
    "Quiero reservar una habitacion hace una semana.",
]

CAT_4_MODIFICACIONES = [
    "Quiero cambiar mi fecha de llegada.",
    "Necesito modificar mi reserva para una habitacion doble.",
    "Deseo extender mi estadia dos noches mas.",
    "Quiero reducir mi estadia.",
    "Necesito cambiar el numero de huespedes.",
    "Quiero pasar de una habitacion simple a una suite.",
    "Deseo cambiar mi fecha de salida.",
    "Quiero mover mi reserva para la proxima semana.",
    "Necesito agregar otra habitacion a mi reserva.",
    "Quiero cambiar mi habitacion por una con balcon.",
]

CAT_5_CANCELACIONES = [
    "Quiero cancelar mi reserva.",
    "Necesito anular mi habitacion.",
    "Deseo cancelar mi hospedaje para manana.",
    "Quiero eliminar mi reserva del sistema.",
    "Necesito cancelar una de mis habitaciones.",
    "Ya no viajare, quiero cancelar.",
    "Deseo cancelar mi suite.",
    "Quiero anular mi estadia.",
    "Necesito cancelar la reserva que hice ayer.",
    "Quiero cancelar mi habitacion familiar.",
]

CAT_6_PREGUNTAS = [
    "Que tipos de habitaciones tienen?",
    "Hay habitaciones disponibles para hoy?",
    "Cuantas personas pueden entrar en una habitacion doble?",
    "Tienen habitaciones familiares?",
    "Puedo reservar para otra persona?",
    "Aceptan reservas el mismo dia?",
    "Hay habitaciones con balcon?",
    "Tienen suites disponibles?",
    "Cual es la hora de entrada?",
    "Cual es la hora de salida?",
]

CAT_7_CONV_NATURAL = [
    "Hola, viajare con mi esposa la proxima semana y queria saber si tienen habitaciones disponibles.",
    "Buenas noches, necesito quedarme solo una noche cerca del centro.",
    "Hola, somos 4 amigos y queremos hospedarnos este sabado.",
    "Quisiera reservar algo comodo porque estare trabajando desde el hotel.",
    "Hola, llegare muy tarde, como a las 11 pm, puedo reservar igual?",
    "Estoy buscando una habitacion tranquila para descansar.",
    "Necesito una habitacion porque tendre una reunion en la ciudad.",
    "Hola, quiero una reserva pero todavia no estoy seguro de la fecha exacta.",
    "Quisiera hospedarme unos dias mientras hago turismo.",
    "Hola, necesito ayuda para encontrar una habitacion para mi familia.",
]

CAT_8_AMBIGUOS = [
    "Quiero algo barato.",
    "Necesito una habitacion grande.",
    "Quiero una reserva como la ultima vez.",
    "Necesito quedarme cerca de la piscina.",
    "Quiero una habitacion elegante.",
    "Necesito varias habitaciones.",
    "Quiero hospedarme pronto.",
    "Necesito una habitacion comoda para trabajar.",
    "Quiero una habitacion bonita.",
    "Necesito algo para manana en la noche.",
]

CAT_9_ORTOGRAFIA = [
    "kiero reservar una abitasion.",
    "nesesito una suite para 3 personas.",
    "quiero ospedarme del 10 al 15.",
    "tienes abitaciones libres?",
    "quiero una avitacion doble.",
    "ola necesito reservar.",
    "qiero una suite.",
    "necesito una reserva urgente xfa.",
    "hola ay cuartos disponibles.",
    "kiero canbiar mi reserva.",
]

CAT_10_LARGOS = [
    "Hola, buenas tardes. Estare viajando con mi familia el proximo mes y quisiera saber si tienen habitaciones familiares disponibles para 4 adultos y 2 ninios durante cinco noches.",
    "Buenas, necesito reservar una habitacion matrimonial porque viajare con mi pareja el siguiente fin de semana. Llegaremos aproximadamente a las 9 de la noche.",
    "Hola, quisiera informacion sobre disponibilidad para hospedarme desde el viernes hasta el lunes con dos amigos.",
    "Quiero reservar varias habitaciones para un grupo de companieros de trabajo que asistiran a un evento.",
    "Necesito cambiar mi reserva porque finalmente viajara una persona mas conmigo.",
    "Hola, quiero reservar una suite para celebrar nuestro aniversario y quisiera una habitacion tranquila.",
    "Quiero hospedarme por dos semanas debido a un viaje laboral.",
    "Buenas noches, estoy buscando una habitacion para manana porque mi vuelo fue cancelado.",
    "Hola, necesito ayuda porque no se que tipo de habitacion elegir para 3 personas.",
    "Quisiera hacer una reserva pero todavia no tengo definida la fecha exacta de salida.",
]

CAT_11_MENU = [
    "menu",
    "Menu",
    "opciones",
    "que puedo hacer",
    "ayuda",
]

CAT_12_FECHAS_NATURALES = [
    "dentro de 3 dias",
    "en 2 semanas",
    "dentro de 1 mes",
    "el dia de manana",
    "el proximo fin de semana",
    "el lunes que viene",
    "dentro de 5 dias",
    "en 1 semana",
]

CAT_13_EXTREMOS = [
    "Quiero reservar 20 habitaciones para manana.",
    "Necesito una habitacion para 15 personas.",
    "Quiero hospedarme durante 3 meses.",
    "Necesito reservar una habitacion dentro de una hora.",
    "Quiero reservar todas las suites disponibles.",
]

# Conversation flows (multi-turn)

FLOW_MENU_NAVEGACION = [
    "menu",
    "1",
    "0",
    "1",
    "2",
    "0",
    "3",
    "0",
    "0",
]

FLOW_RESERVA_COMPLETA = [
    DNI_REAL,
    "menu",
    "1",
    "1",
    "manana",
    "2026-07-01",
    "101",
    "si",
]

FLOW_CANCELACION = [
    DNI_REAL,
    "menu",
    "1",
    "2",
]

if __name__ == "__main__":
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    REPORT.append(f"| Reporte generado: {now_str} | | |")

    categories = [
        ("1. Reservas basicas", CAT_1_RESERVAS, True),
        ("2. Falta informacion", CAT_2_FALTA_INFO, True),
        ("3. Fechas invalidas", CAT_3_FECHAS_INVALIDAS, True),
        ("4. Modificaciones", CAT_4_MODIFICACIONES, True),
        ("5. Cancelaciones", CAT_5_CANCELACIONES, True),
        ("6. Preguntas frecuentes", CAT_6_PREGUNTAS, False),
        ("7. Conversaciones naturales", CAT_7_CONV_NATURAL, False),
        ("8. Casos ambiguos", CAT_8_AMBIGUOS, False),
        ("9. Errores ortografia", CAT_9_ORTOGRAFIA, False),
        ("10. Mensajes largos", CAT_10_LARGOS, False),
        ("11. Menu y opciones", CAT_11_MENU, False),
        ("12. Fechas naturales", CAT_12_FECHAS_NATURALES, False),
        ("13. Casos extremos", CAT_13_EXTREMOS, True),
    ]

    for name, cases, needs_dni in categories:
        run_category(name, cases, needs_dni)

    # Full conversation flows
    run_conversation_flow("14. Navegacion completa del menu", FLOW_MENU_NAVEGACION)

    guardar_report()
