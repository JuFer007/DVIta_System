from datetime import date, datetime
import tools as t
from conversation_context import ConversationContext

# ─── MENU ─────────────────────────────────────────────────────────────────────

MENUS = {
    "main": {
        "title": "MENU PRINCIPAL",
        "items": [
            ("1", "Reservas", "menu_reservas"),
            ("2", "Habitaciones / Precios", "menu_habitaciones"),
            ("3", "Contacto / Servicios", "menu_contacto"),
            ("4", "Informacion", "menu_info"),
            ("5", "Ayuda", "ayuda"),
            ("0", "Salir", "salir"),
        ],
    },
    "reservas": {
        "title": "RESERVAS",
        "items": [
            ("1", "Nueva reserva", "crear_reserva"),
            ("2", "Cancelar reserva", "cancelar_reserva"),
            ("3", "Ver mis reservas", "buscar_reserva"),
            ("0", "Volver", "volver"),
        ],
    },
    "habitaciones": {
        "title": "HABITACIONES",
        "items": [
            ("1", "Ver disponibilidad", "disponibilidad"),
            ("2", "Ver precios", "precios"),
            ("0", "Volver", "volver"),
        ],
    },
    "contacto": {
        "title": "CONTACTO / SERVICIOS",
        "items": [
            ("1", "Telefono / WhatsApp", "contacto"),
            ("2", "Direccion", "contacto_dir"),
            ("3", "Servicios incluidos", "servicios"),
            ("4", "Horario de atencion", "contacto_horario"),
            ("0", "Volver", "volver"),
        ],
    },
    "info": {
        "title": "INFORMACION",
        "items": [
            ("1", "Ubicacion / Direccion", "info_ubicacion"),
            ("2", "Telefono / WhatsApp", "info_telefono"),
            ("3", "Correo electronico", "info_correo"),
            ("4", "Horario de atencion", "info_horario"),
            ("5", "Servicios incluidos", "info_servicios"),
            ("0", "Volver", "volver"),
        ],
    },
}

def _build_menu_text(menu: dict) -> str:
    lines = [f"=== {menu['title']} ==="]
    for key, label, _ in menu["items"]:
        lines.append(f"{key}. {label}")
    return "\n".join(lines)

async def handle_menu_intent(ctx: ConversationContext) -> str:
    ctx.menu_path = ["main"]
    return _build_menu_text(MENUS["main"])

async def handle_menu_option(msg: str, ctx: ConversationContext) -> str | None:
    if not ctx.is_in_menu():
        return None

    current = ctx.current_menu()
    menu = MENUS.get(current)
    if not menu:
        ctx.menu_path = []
        return _build_menu_text(MENUS["main"])

    # Try numeric option
    from intent_detector import extraer_numero
    num = extraer_numero(msg)
    if num is not None:
        for key, label, action in menu["items"]:
            if key == str(num):
                if action == "volver":
                    ctx.pop_menu()
                    if ctx.is_in_menu():
                        parent = ctx.current_menu()
                        parent_menu = MENUS.get(parent)
                        return _build_menu_text(parent_menu) if parent_menu else _build_menu_text(MENUS["main"])
                    ctx.menu_path = []
                    return _build_menu_text(MENUS["main"])
                if action == "salir":
                    ctx.reset()
                    return "Hasta luego! Vuelve cuando quieras."
                if action.startswith("menu_"):
                    sub = action.replace("menu_", "")
                    if sub in MENUS:
                        ctx.push_menu(sub)
                        return _build_menu_text(MENUS[sub])
                    return _build_menu_text(MENUS["main"])
                if action == "ayuda":
                    return _handle_ayuda()
                if action == "crear_reserva":
                    if not ctx.is_identified():
                        ctx.set_pending("esperando_dni", {"intent": "crear_reserva"})
                        ctx.menu_path = []
                        return "Claro! Primero necesito tu **DNI** para ubicarte. Cual es?"
                    ctx.menu_path = []
                    r = await iniciar_wizard_reserva(ctx)
                    if r:
                        return r
                    ctx.menu_path = ["main"]
                    return _build_menu_text(MENUS["main"])
                if action == "cancelar_reserva":
                    ctx.menu_path = []
                    r = await handle_cancelar_reserva(msg, ctx)
                    return r
                if action == "buscar_reserva":
                    if not ctx.is_identified():
                        ctx.set_pending("esperando_dni", {"intent": "buscar_reserva"})
                        ctx.menu_path = []
                        return "Claro! Primero necesito tu **DNI** para buscar tus reservas. Cual es?"
                    ctx.menu_path = []
                    r = await handle_mis_reservas(ctx)
                    return r
                if action == "disponibilidad":
                    ctx.menu_path = []
                    return await handle_disponibilidad(ctx)
                if action == "precios":
                    ctx.menu_path = []
                    return handle_precios()
                if action == "contacto":
                    ctx.menu_path = []
                    return handle_contacto()
                if action == "servicios":
                    ctx.menu_path = []
                    return handle_servicios()
                if action == "contacto_dir":
                    ctx.menu_path = []
                    return handle_contacto_dir()
                if action == "contacto_horario":
                    ctx.menu_path = []
                    return handle_contacto_horario()
                if action == "info_ubicacion":
                    ctx.menu_path = []
                    return handle_info_ubicacion()
                if action == "info_telefono":
                    ctx.menu_path = []
                    return handle_info_telefono()
                if action == "info_correo":
                    ctx.menu_path = []
                    return handle_info_correo()
                if action == "info_horario":
                    ctx.menu_path = []
                    return handle_info_horario()
                if action == "info_servicios":
                    ctx.menu_path = []
                    return handle_info_servicios()
                return _build_menu_text(MENUS["main"])
        return f"Opcion no valida. Elige un numero del menu:\n\n{_build_menu_text(menu)}"

    return None

def _handle_ayuda() -> str:
    return (
        "Soy DViBot, tu asistente de Hospedaje D'Vita.\n\n"
        "Puedo ayudarte con:\n"
        "  **Reservas** - Crear, cancelar o consultar reservas\n"
        "  **Habitaciones** - Ver disponibilidad y precios\n"
        "  **Contacto** - Telefono, direccion, servicios\n\n"
        "Escribe **menu** en cualquier momento para ver las opciones.\n"
        "O simplemente dime lo que necesitas de forma natural!"
    )

# ─── DNI ──────────────────────────────────────────────────────────────────────

async def buscar_cliente_por_dni(dni: str, ctx: ConversationContext) -> str:
    if not dni or len(dni) != 8:
        return "El DNI debe tener 8 digitos. Intenta de nuevo."

    clientes = await t.listar_clientes()
    if isinstance(clientes, dict) and "error" in clientes:
        return "No pude verificar tus datos. Llama al +51 922 626 148."

    if isinstance(clientes, list):
        for c in clientes:
            if c.get("dni") == dni:
                nombre = f"{c.get('nombre', '')} {c.get('apellidoPaterno', '')}".strip()
                ctx.set_cliente(
                    dni=dni,
                    nombre=nombre,
                    id_cliente=c.get("idCliente"),
                    telefono=c.get("telefono", ""),
                )
                return f"Bienvenido **{nombre}**! Ya te tengo en el sistema. ¿En que puedo ayudarte?"

    ctx.dni = dni
    ctx.set_pending("registro_cliente", {"dni": dni})
    return (
        "No encontre un cliente con ese DNI. "
        "Quieres **registrarte**? (responde **si** o **no**)"
    )

async def registrar_cliente_nuevo(ctx: ConversationContext) -> str:
    dni = ctx.pending_data.get("dni") or ctx.dni
    if not dni:
        return "No tengo tu DNI. Escribelo para empezar."
    ctx.clear_pending()
    ctx.start_wizard("reg_nombre", {"dni": dni})
    return "Para registrarte, escribeme tu **nombre completo** (nombres y apellidos):"

async def procesar_registro(message: str, ctx: ConversationContext) -> str | None:
    if not message or not message.strip():
        return None
    msg = message.strip()

    if ctx.wizard_step == "reg_nombre":
        partes = msg.split()
        if len(partes) < 2:
            return "Por favor indica **nombre y apellido**. Ej: Maria Lopez Rios"
        ctx.advance_wizard("reg_telefono", {
            "dni": ctx.wizard_data.get("dni"),
            "nombre": partes[0],
            "apellido_paterno": partes[1] if len(partes) > 1 else "",
            "apellido_materno": partes[2] if len(partes) > 2 else "",
        })
        return "Cual es tu **numero de telefono** (WhatsApp)?"

    if ctx.wizard_step == "reg_telefono":
        telf = msg.replace(" ", "").replace("-", "").replace("+", "")
        if not telf.isdigit() or len(telf) < 9:
            return "Ingresa un **telefono valido** de al menos 9 digitos. Ej: 987654321"

        data = ctx.wizard_data
        dni = data.get("dni", "")
        if len(dni) != 8:
            return "Error: DNI invalido. Empecemos de nuevo. Escribe tu **DNI**."

        resultado = await t.crear_cliente(
            nombre=data.get("nombre", ""),
            apellido_paterno=data.get("apellido_paterno", ""),
            apellido_materno=data.get("apellido_materno", ""),
            dni=dni,
            telefono=telf,
        )
        ctx.clear_wizard()
        if isinstance(resultado, dict) and "error" in resultado:
            ctx.dni = None
            return f"No pude registrarte: {resultado['error']}. Llama al +51 922 626 148."

        ctx.set_cliente(
            dni=dni,
            nombre=f"{data.get('nombre', '')} {data.get('apellido_paterno', '')}".strip(),
            id_cliente=resultado.get("idCliente"),
            telefono=telf,
        )
        return f"Listo **{ctx.nombre_cliente}**, ya estas registrado! Que necesitas?"

    return None

# ─── DISPONIBILIDAD ───────────────────────────────────────────────────────────

async def handle_disponibilidad(ctx: ConversationContext) -> str:
    habs = await t.listar_habitaciones_disponibles()
    if isinstance(habs, dict) and "error" in habs:
        return "No pude verificar disponibilidad. Llama al +51 922 626 148."
    if not isinstance(habs, list) or not habs:
        return "Lo siento, no hay habitaciones disponibles en este momento."

    lines = [f"Tenemos **{len(habs)}** disponible(s):"]
    for h in habs:
        tipo = h.get("tipoHabitacion", {})
        desc = tipo.get("descripcion", "Estandar") if isinstance(tipo, dict) else "Estandar"
        lines.append(f"  Hab. **{h.get('numeroHabitacion')}** - {desc} | S/. {h.get('precio')}/noche")
    lines.append("\nQuieres **reservar** alguna?")
    return "\n".join(lines)

# ─── PRECIOS ──────────────────────────────────────────────────────────────────

def handle_precios() -> str:
    return (
        "Estos son nuestros precios por noche:\n\n"
        "  **Estandar** - S/. 60 (TV Cable, bano privado, WiFi)\n"
        "  **Suite Deluxe** - S/. 120 (TV 50, sala, mini bar)\n"
        "  **Familiar** - S/. 180 (3 camas, area adicional)\n\n"
        "Todos incluyen desayuno y WiFi.\n"
        "Quieres **reservar**?"
    )

def handle_contacto() -> str:
    return (
        "Puedes contactarnos:\n\n"
        "  **Telefono / WhatsApp**: +51 922 626 148\n"
        "  **Email**: DVitaHospedaje@gmail.com\n"
        "  **Direccion**: Victor Raul Haya de la Torre N 281, Chiclayo\n\n"
        "Atendemos 24/7."
    )

def handle_contacto_dir() -> str:
    return (
        "Estamos en **Victor Raul Haya de la Torre N 281, Chiclayo, Peru**.\n\n"
        "Atencion 24 horas. Te esperamos!"
    )

def handle_servicios() -> str:
    return (
        "Todas nuestras habitaciones incluyen:\n\n"
        "  **Desayuno** continental incluido\n"
        "  **WiFi** de alta velocidad\n"
        "  **TV Cable**\n"
        "  **Agua caliente** 24/7\n"
        "  **Estacionamiento** privado"
    )

def handle_contacto_horario() -> str:
    return (
        "Hospedaje D'Vita atiende **las 24 horas, los 7 dias de la semana**.\n"
        "Siempre hay personal en recepcion para asistirte."
    )

# ─── INFORMACION ──────────────────────────────────────────────────────────────

def handle_info_ubicacion() -> str:
    return (
        "📍 Estamos ubicados en **Victor Raul Haya de la Torre N 281, Chiclayo, Peru**.\n\n"
        "Atencion 24 horas. Te esperamos!"
    )

def handle_info_telefono() -> str:
    return (
        "📞 Puedes contactarnos al:\n\n"
        "  **Telefono / WhatsApp**: +51 922 626 148\n\n"
        "Estamos disponibles 24/7 para atenderte."
    )

def handle_info_correo() -> str:
    return (
        "📧 Puedes escribirnos a:\n\n"
        "  **Correo electronico**: DVitaHospedaje@gmail.com\n\n"
        "Te responderemos a la brevedad."
    )

def handle_info_horario() -> str:
    return (
        "🕐 **Horario de atencion:**\n\n"
        "  **Lunes a Domingo** — 24 horas\n"
        "  **Feriados** — 24 horas\n\n"
        "Siempre hay personal en recepcion para asistirte."
    )

def handle_info_servicios() -> str:
    return (
        "✨ **Servicios incluidos en todas las habitaciones:**\n\n"
        "  **Desayuno** continental incluido\n"
        "  **WiFi** de alta velocidad\n"
        "  **TV Cable**\n"
        "  **Agua caliente** 24/7\n"
        "  **Estacionamiento** privado\n\n"
        "¿Deseas ver disponibilidad o hacer una reserva?"
    )

# ─── RESERVAS ─────────────────────────────────────────────────────────────────

async def handle_mis_reservas(ctx: ConversationContext) -> str:
    if not ctx.is_identified():
        return ""
    reservas = await t.listar_reservas()
    if not isinstance(reservas, list):
        return "No pude consultar tus reservas. Llama al +51 922 626 148."

    mis = [r for r in reservas if r.get("cliente", {}).get("idCliente") == ctx.id_cliente]
    if not mis:
        return "No tienes reservas. Quieres **hacer una**?"

    lines = ["Tus reservas:\n"]
    for r in mis:
        hab = r.get("habitacion", {}).get("numeroHabitacion", "?") if isinstance(r.get("habitacion"), dict) else "?"
        lines.append(
            f"  **#{r.get('idReserva')}** - Hab. {hab} | "
            f"{r.get('fechaIngreso')} a {r.get('fechaSalida')} | "
            f"**{r.get('estadoReserva')}**"
        )
    return "\n".join(lines)

async def handle_mis_reservas_texto(ctx: ConversationContext) -> str:
    if not ctx.is_identified():
        return ""
    reservas = await t.listar_reservas()
    if not isinstance(reservas, list):
        return "No pude consultar tus reservas."

    mis = [r for r in reservas if r.get("cliente", {}).get("idCliente") == ctx.id_cliente]
    if not mis:
        return "No tienes reservas activas."

    lines = ["Tus reservas:\n"]
    for r in mis:
        hab = r.get("habitacion", {}).get("numeroHabitacion", "?") if isinstance(r.get("habitacion"), dict) else "?"
        lines.append(
            f"  **#{r.get('idReserva')}** - Hab. {hab} | "
            f"{r.get('fechaIngreso')} a {r.get('fechaSalida')} | "
            f"**{r.get('estadoReserva')}**"
        )
    return "\n".join(lines)

# ─── CANCELACION REDISENIADA ─────────────────────────────────────────────────

async def handle_cancelar_reserva(message: str, ctx: ConversationContext) -> str:
    if not ctx.is_identified():
        ctx.set_pending("esperando_dni", {"intent": "cancelar_reserva"})
        return "Claro, pero primero necesito tu **DNI** para ubicarte. Cual es?"

    # Show upcoming reservations from today onwards
    return await _mostrar_reservas_futuras(ctx)

async def _mostrar_reservas_futuras(ctx: ConversationContext) -> str:
    from datetime import date
    reservas = await t.listar_reservas()
    if not isinstance(reservas, list):
        return "No pude consultar tus reservas. Llama al +51 922 626 148."

    hoy = date.today()
    mis = [
        r for r in reservas
        if r.get("cliente", {}).get("idCliente") == ctx.id_cliente
        and r.get("estadoReserva") in ("PENDIENTE", "CONFIRMADA")
    ]

    # Filter by future date
    futuras = []
    for r in mis:
        try:
            f_ingreso = r.get("fechaIngreso", "")
            if f_ingreso:
                fecha_ing = datetime.strptime(f_ingreso, "%Y-%m-%d").date()
                if fecha_ing >= hoy:
                    futuras.append(r)
        except (ValueError, TypeError):
            pass

    if not futuras:
        return "No tienes reservas futuras para cancelar. Quieres **hacer una**?"

    lines = ["Tus reservas futuras:\n"]
    for i, r in enumerate(futuras, 1):
        hab = r.get("habitacion", {}).get("numeroHabitacion", "?") if isinstance(r.get("habitacion"), dict) else "?"
        lines.append(
            f"  **{i}.** #{r.get('idReserva')} - Hab. {hab} | "
            f"{r.get('fechaIngreso')} a {r.get('fechaSalida')} | "
            f"**{r.get('estadoReserva')}**"
        )
    lines.append("\nEscribe el **numero** de la reserva que quieres cancelar.")

    ctx.set_pending("esperando_cancelar_id", {"futuras": futuras})
    return "\n".join(lines)

async def _buscar_y_confirmar_cancelacion(num: int, ctx) -> str:
    futuras = ctx.pending_data.get("futuras", [])

    if num < 1 or num > len(futuras):
        return f"Elige un numero entre 1 y {len(futuras)}."

    reserva = futuras[num - 1]
    id_reserva = reserva.get("idReserva")
    estado = reserva.get("estadoReserva", "")

    if estado in ("CANCELADA", "COMPLETADA"):
        ctx.set_pending("esperando_cancelar_id", {"futuras": futuras})
        return (
            f"La reserva **#{id_reserva}** ya esta **{estado}**.\n"
            "Escribe **otro numero**."
        )

    # Double confirmation
    ctx.set_pending("confirmar_cancelacion", {"id": id_reserva, "confirmado": False})
    return (
        f"Reserva **#{id_reserva}**:\n"
        f"  Habitacion: {reserva.get('habitacion', {}).get('numeroHabitacion', '?')}\n"
        f"  Ingreso: {reserva.get('fechaIngreso', '?')}\n"
        f"  Salida: {reserva.get('fechaSalida', '?')}\n\n"
        "Confirmas que deseas **CANCELAR** esta reserva? Esta accion no se puede deshacer.\n"
        "(**si** o **no**)"
    )

async def ejecutar_cancelacion(ctx: ConversationContext) -> str:
    id_reserva = ctx.pending_data.get("id")
    if not id_reserva:
        return "Error: no tengo el ID de la reserva. Escribe **menu** para empezar de nuevo."

    result = await t.cancelar_reserva(id_reserva)
    ctx.reset()

    if isinstance(result, dict) and "error" in result:
        return f"No pude cancelar: {result['error']}"

    return (
        f"**Reserva #{id_reserva} cancelada exitosamente.**\n\n"
        f"Tu sesion ha sido finalizada por seguridad.\n"
        f"Escribe **menu** si necesitas algo mas."
    )

# ─── WIZARD DE RESERVA ────────────────────────────────────────────────────────

async def iniciar_wizard_reserva(ctx: ConversationContext) -> str:
    if not ctx.is_identified():
        return ""
    ctx.start_wizard("res_fecha_ingreso")
    return "Para que fecha quieres **ingresar**? (ej: 2026-06-15, manana, 15 de junio)"

async def procesar_wizard_reserva(message: str, ctx: ConversationContext) -> str | None:
    from intent_detector import extraer_numero, es_confirmacion, es_cancelacion, es_agradecimiento, es_despedida
    from date_parser import parsear_fecha, parsear_rango

    if not message or not message.strip():
        return None
    msg = message.strip()
    step = ctx.wizard_step
    if not step:
        return None

    if es_cancelacion(msg) or es_despedida(msg):
        ctx.clear_wizard()
        return "Reserva cancelada. Cuando quieras, me dices."
    if es_agradecimiento(msg):
        return "De nada. Seguimos?"

    import re
    es_fecha = bool(re.match(r"^\d{4}-\d{2}-\d{2}$", msg))

    def _formatear(f: date) -> str:
        return f.strftime("%Y-%m-%d")

    if step == "res_fecha_ingreso":
        fecha = msg if es_fecha else None
        if not fecha:
            # Try range first
            inicio, fin = parsear_rango(msg)
            if inicio and fin:
                ctx.advance_wizard("res_fecha_salida", {"fecha_ingreso": _formatear(inicio)})
                salida_str = _formatear(fin)
                ctx.wizard_data["fecha_salida"] = salida_str
                return await _mostrar_habitaciones(ctx, _formatear(inicio), salida_str)
            f = parsear_fecha(msg)
            if f:
                if f < date.today():
                    return "La fecha de ingreso no puede ser en el pasado. Elige otra fecha."
                fecha = _formatear(f)
        if not fecha:
            return "Dime la fecha. Ej: **2026-06-15**, **manana**, o **15 de junio**"
        if fecha < str(date.today()):
            return "La fecha de ingreso no puede ser en el pasado. Elige otra fecha."
        ctx.advance_wizard("res_fecha_salida", {"fecha_ingreso": fecha})
        return "Y tu fecha de **salida**?"

    if step == "res_fecha_salida":
        fecha = msg if es_fecha else None
        if not fecha:
            f = parsear_fecha(msg)
            if f:
                fecha = _formatear(f)
        if not fecha:
            return "Dime la fecha. Ej: **2026-06-20**, **18 de junio**"
        ingreso = ctx.wizard_data.get("fecha_ingreso", "")
        if fecha <= ingreso:
            return "La salida debe ser **posterior** al ingreso."

        return await _mostrar_habitaciones(ctx, ingreso, fecha)

    if step == "res_habitacion":
        num = extraer_numero(msg)
        habs = ctx.wizard_data.get("habitaciones", [])
        if not isinstance(habs, list):
            habs = []
        nums = []
        for h in habs:
            try:
                nums.append(int(h.get("numeroHabitacion", 0)))
            except (ValueError, TypeError):
                pass
        if not num or num not in nums:
            return f"Elige una: {', '.join(str(n) for n in nums)}"

        hab = next((h for h in habs if h.get("numeroHabitacion") == num), None)
        if not hab:
            return f"No encontre la habitacion {num}. Elige otra."

        hab_id = hab.get("idHabitacion")
        if not hab_id:
            return "Error con la habitacion. Intenta de nuevo."

        ctx.advance_wizard("res_confirmar", {"id_habitacion": hab_id})

        d = ctx.wizard_data
        return (
            f"**Resumen de tu reserva:**\n\n"
            f"  Cliente: **{ctx.nombre_cliente}**\n"
            f"  Habitacion: **{num}**\n"
            f"  Ingreso: {d.get('fecha_ingreso', '?')}\n"
            f"  Salida: {d.get('fecha_salida', '?')}\n\n"
            "Confirmas? (**si** o **no**)"
        )

    if step == "res_confirmar":
        if es_cancelacion(msg):
            ctx.clear_wizard()
            return "Reserva cancelada."
        if not es_confirmacion(msg):
            return "Responde **si** o **no**."

        d = ctx.wizard_data

        # Validate all data before creating
        id_cliente = ctx.id_cliente
        id_hab = d.get("id_habitacion")
        ingreso = d.get("fecha_ingreso")
        salida = d.get("fecha_salida")

        if not all([id_cliente, id_hab, ingreso, salida]):
            ctx.clear_wizard()
            return "Faltan datos para crear la reserva. Empecemos de nuevo."

        # Get DviBot employee
        id_empleado = await t.get_dvibot_empleado_id()

        result = await t.crear_reserva(
            id_cliente=id_cliente,
            id_habitacion=id_hab,
            fecha_reserva=str(date.today()),
            fecha_ingreso=ingreso,
            fecha_salida=salida,
            id_empleado=id_empleado,
        )

        ctx.clear_wizard()
        if isinstance(result, dict) and "error" in result:
            return f"No pude crear la reserva: {result['error']}. Llama al +51 922 626 148."

        reserva_id = result.get("idReserva", "?")
        ctx.reset()

        return (
            f"**Reserva #{reserva_id} creada exitosamente!**\n\n"
            f"  Ingreso: {ingreso}\n"
            f"  Salida: {salida}\n"
            f"  Registrado por: DViBot\n\n"
            f"Tu sesion ha sido finalizada por seguridad.\n"
            f"Escribe **menu** si necesitas algo mas."
        )

    return None

async def _mostrar_habitaciones(ctx: ConversationContext, ingreso: str, salida: str) -> str:
    ctx.advance_wizard("res_habitacion", {"fecha_salida": salida})

    habs = await t.listar_habitaciones_disponibles_por_fechas(ingreso, salida)
    if isinstance(habs, dict) and "error" in habs:
        ctx.clear_wizard()
        return "Error al consultar disponibilidad. Llama al +51 922 626 148."
    if not isinstance(habs, list) or not habs:
        ctx.clear_wizard()
        return "No hay habitaciones disponibles en esas fechas."

    ctx.wizard_data["habitaciones"] = habs
    lines = ["Para esas fechas tenemos:"]
    for h in habs:
        tipo = h.get("tipoHabitacion", {})
        desc = tipo.get("descripcion", "Estandar") if isinstance(tipo, dict) else "Estandar"
        lines.append(f"  Hab. **{h.get('numeroHabitacion')}** - {desc} | S/. {h.get('precio')}/noche")
    lines.append("\nCual **te gusta**? (dime el numero)")
    return "\n".join(lines)
