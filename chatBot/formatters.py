def format_habitaciones_disponibles(habs: list) -> str:
    if not habs:
        return (
            "Actualmente **no hay habitaciones disponibles**. "
            "Por favor llámanos al +51 922 626 148 o escríbenos para buscar una fecha alternativa."
        )
    lines = [f"Encontré **{len(habs)} habitación(es) disponible(s)**:\n"]
    for h in habs:
        tipo = (
            h.get("tipoHabitacion", {}).get("descripcion", "Sin tipo")
            if h.get("tipoHabitacion") else "Sin tipo"
        )
        precio = h.get("precio", "?")
        num = h.get("numeroHabitacion", "?")
        lines.append(f"• **Hab. {num}** — {tipo} | S/. {precio}/noche")
    lines.append("\n¿Deseas realizar una reserva?")
    return "\n".join(lines)

def format_reserva_detalle(r: dict) -> str:
    cliente = _nombre_cliente(r.get("cliente"))
    hab = (
        r.get("habitacion", {}).get("numeroHabitacion", "?")
        if r.get("habitacion") else "?"
    )
    estado = r.get("estadoReserva", "?")
    estado_label = {
        "PENDIENTE": "Pendiente de confirmación",
        "CONFIRMADA": "Confirmada (check-in realizado)",
        "CANCELADA": "Cancelada",
        "COMPLETADA": "Completada (check-out realizado)",
    }.get(estado, estado)

    return (
        f"**Reserva #{r.get('idReserva', '?')}**\n\n"
        f"• Cliente: {cliente}\n"
        f"• Habitación: {hab}\n"
        f"• Fecha de ingreso: {r.get('fechaIngreso', '?')}\n"
        f"• Fecha de salida: {r.get('fechaSalida', '?')}\n"
        f"• Estado: **{estado_label}**\n\n"
        f"¿Necesitas hacer algo más con esta reserva? "
        f"Puedo cancelarla si aún está pendiente."
    )

def format_confirmacion_reserva(r: dict) -> str:
    return (
        f"**¡Reserva creada exitosamente!**\n\n"
        f"• N° de reserva: **#{r.get('idReserva', '?')}**\n"
        f"• Fecha de ingreso: {r.get('fechaIngreso', '?')}\n"
        f"• Fecha de salida: {r.get('fechaSalida', '?')}\n"
        f"• Estado: Pendiente de confirmación\n\n"
        f"Nuestro equipo se comunicará contigo para coordinar el pago y confirmar tu estadía. "
        f"También puedes llamarnos al +51 922 626 148."
    )

def format_precios() -> str:
    return (
        "Nuestras tarifas por noche son:\n\n"
        "• **Habitación Estándar** — S/. 60/noche\n"
        "  TV Cable, baño privado, WiFi, agua caliente\n\n"
        "• **Suite Deluxe** — S/. 120/noche\n"
        "  TV 50\", sala de estar, mini bar, vista exterior\n\n"
        "• **Habitación Familiar** — S/. 180/noche\n"
        "  3 camas, área adicional, TV Cable, frigobar\n\n"
        "Todos los precios incluyen **desayuno y WiFi**. "
        "¿Deseas ver disponibilidad o hacer una reserva?"
    )

# ─── Helpers internos ─────────────────────────────────────────────────────────

def _nombre_cliente(cliente: dict | None) -> str:
    if not cliente:
        return "—"
    return f"{cliente.get('nombre', '')} {cliente.get('apellidoPaterno', '')}".strip() or "—"
