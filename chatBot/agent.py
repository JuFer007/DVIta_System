import ollama_client
import handlers as h
from conversation_context import get_context
from intent_detector import (
    es_saludo, es_despedida, es_agradecimiento,
    es_dni_valido, extraer_dni, detect_intent,
    es_confirmacion, es_cancelacion, es_no_se,
    extraer_numero,
)

async def _ejecutar_intent(intent: str, msg: str, ctx) -> str | None:
    if intent == "disponibilidad":
        return await h.handle_disponibilidad(ctx)
    if intent == "precios":
        return h.handle_precios()
    if intent == "crear_reserva":
        return await h.iniciar_wizard_reserva(ctx)
    if intent == "buscar_reserva":
        return await h.handle_mis_reservas(ctx)
    if intent == "cancelar_reserva":
        return await h.handle_cancelar_reserva(msg, ctx)
    if intent == "modificar_reserva":
        return (
            "Por ahora las modificaciones se atienden por telefono. "
            "Llama al **+51 922 626 148** para cambiar tu reserva. "
            "Quieres **cancelarla** y hacer una nueva?"
        )
    if intent == "contacto":
        return h.handle_contacto()
    if intent == "servicios":
        return h.handle_servicios()
    if intent == "menu":
        return await h.handle_menu_intent(ctx)
    if intent == "ayuda":
        return h._handle_ayuda()
    if intent == "volver":
        if ctx.is_in_menu():
            ctx.pop_menu()
            if ctx.is_in_menu():
                parent = ctx.current_menu()
                parent_menu = h.MENUS.get(parent)
                return h._build_menu_text(parent_menu) if parent_menu else await h.handle_menu_intent(ctx)
        return await h.handle_menu_intent(ctx)
    if intent == "salir":
        ctx.reset()
        return "Hasta luego! Vuelve cuando quieras."
    return None

INTENTOS_CON_DNI = {"crear_reserva", "cancelar_reserva", "buscar_reserva", "modificar_reserva"}
INTENTS_SIN_DNI = {"disponibilidad", "precios", "contacto", "servicios", "menu", "ayuda", "volver", "salir"}

async def chat(messages: list[dict], session_id: str) -> str:
    if not messages or not isinstance(messages, list):
        return "Hola! Soy DViBot. Escribe **menu** para ver las opciones disponibles."

    last = messages[-1]
    if not isinstance(last, dict) or "content" not in last:
        return "Hola! Escribe **menu** para ver las opciones."

    msg = last["content"].strip() if isinstance(last["content"], str) else ""
    if not msg:
        return "Hola! Escribe **menu** para ver las opciones."

    ctx = get_context(session_id)

    # ── 1. Accion pendiente ──────────────────────────────────────────────────
    if ctx.pending_action:
        if ctx.pending_action == "registro_cliente":
            if es_confirmacion(msg):
                return await h.registrar_cliente_nuevo(ctx)
            if es_cancelacion(msg):
                ctx.clear_pending()
                ctx.dni = None
                return "Ok, dime tu **DNI** cuando quieras."
            return "Responde **si** o **no**."

        if ctx.pending_action == "esperando_cancelar_id":
            if es_no_se(msg):
                reservas = await h.handle_mis_reservas_texto(ctx)
                return f"{reservas}\n\nEscribe el **numero** de la que quieres cancelar."
            num = extraer_numero(msg)
            if not num:
                return "Indica el **numero** de la reserva (1, 2, 3...)."
            return await h._buscar_y_confirmar_cancelacion(num, ctx)

        if ctx.pending_action == "confirmar_cancelacion":
            if es_confirmacion(msg):
                return await h.ejecutar_cancelacion(ctx)
            if es_cancelacion(msg):
                ctx.clear_pending()
                return "Cancelacion abortada. Escribe **menu** para ver opciones."
            return "Responde **si** (confirmar cancelacion) o **no** (abortar)."

        if ctx.pending_action == "esperando_dni":
            dni_raw = msg if es_dni_valido(msg) else extraer_dni(msg)
            if dni_raw:
                intent_pendiente = ctx.pending_data.get("intent")
                ctx.clear_pending()
                result = await h.buscar_cliente_por_dni(dni_raw, ctx)
                if ctx.is_identified() and intent_pendiente:
                    r = await _ejecutar_intent(intent_pendiente, msg, ctx)
                    if r:
                        return r
                return result
            return "Necesito tu **DNI** de 8 digitos para eso. Cual es?"

    # ── 2. Wizard en progreso ────────────────────────────────────────
    if ctx.wizard_step:
        if ctx.wizard_step.startswith("reg_"):
            r = await h.procesar_registro(msg, ctx)
            if r:
                return r
        if ctx.wizard_step.startswith("res_"):
            r = await h.procesar_wizard_reserva(msg, ctx)
            if r:
                return r
        ctx.clear_wizard()
        return "Ocurrio un error. Puedes empezar de nuevo. Escribe **menu**."

    # ── 3. Menu activo ──────────────────────────────────────────────
    if ctx.is_in_menu():
        r = await h.handle_menu_option(msg, ctx)
        if r:
            return r
        ctx.menu_path = []

    # ── 4. No identificado ──────────────────────────────────────────
    if not ctx.is_identified():
        if es_dni_valido(msg):
            return await h.buscar_cliente_por_dni(msg, ctx)
        dni = extraer_dni(msg)
        if dni:
            return await h.buscar_cliente_por_dni(dni, ctx)

        if es_agradecimiento(msg):
            return "De nada! Cuando quieras ayuda, solo dime tu **DNI**."
        if es_despedida(msg):
            return "Hasta luego! Vuelve cuando quieras."

        intent = detect_intent(msg)
        if intent in INTENTS_SIN_DNI:
            return await _ejecutar_intent(intent, msg, ctx)
        if intent in INTENTOS_CON_DNI:
            ctx.set_pending("esperando_dni", {"intent": intent})
            return "Claro, pero primero necesito tu **DNI** para ubicarte. Cual es?"

        intent_ia = await ollama_client.classify_intent(msg)
        if intent_ia:
            if intent_ia in INTENTS_SIN_DNI:
                return await _ejecutar_intent(intent_ia, msg, ctx)
            if intent_ia in INTENTOS_CON_DNI:
                ctx.set_pending("esperando_dni", {"intent": intent_ia})
                return "Dame tu **DNI** primero y te ayudo con eso."

        respuesta = await ollama_client.chat(messages)
        if respuesta:
            return respuesta
        return "En que puedo ayudarte? Escribe **menu** para ver opciones."

    # ── 5. Identificado ─────────────────────────────────────────────
    if es_agradecimiento(msg):
        return "De nada! Para eso estoy."
    if es_despedida(msg):
        ctx.reset()
        return "Hasta luego! Cuando quieras, solo dime tu **DNI**."

    intent = detect_intent(msg)
    if intent:
        return await _ejecutar_intent(intent, msg, ctx)

    intent_ia = await ollama_client.classify_intent(msg)
    if intent_ia and intent_ia != "saludo":
        return await _ejecutar_intent(intent_ia, msg, ctx)

    respuesta = await ollama_client.chat(messages, ctx)
    if respuesta:
        return respuesta

    return "No entendi. Escribe **menu** para ver las opciones."
