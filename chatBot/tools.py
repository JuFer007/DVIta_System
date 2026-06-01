import httpx
import os
from typing import Any

BASE = os.getenv("BACKEND_URL", "http://localhost:8080")
TIMEOUT = 10

DVIBOT_EMPLEADO_ID: int | None = None

async def _get(path: str) -> Any:
    if not path:
        return {"error": "path vacio"}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.get(f"{BASE}/api/{path}")
            r.raise_for_status()
            return r.json()
        except httpx.HTTPError as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": f"Error inesperado: {e}"}

async def _get_with_params(path: str, params: dict) -> Any:
    if not path:
        return {"error": "path vacio"}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.get(f"{BASE}/api/{path}", params=params)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPError as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": f"Error inesperado: {e}"}

async def _post(path: str, data: dict) -> Any:
    if not path:
        return {"error": "path vacio"}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.post(f"{BASE}/api/{path}", json=data)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPError as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": f"Error inesperado: {e}"}

async def _put(path: str, data: dict) -> Any:
    if not path:
        return {"error": "path vacio"}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.put(f"{BASE}/api/{path}", json=data)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPError as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": f"Error inesperado: {e}"}

# DviBot empleado lookup

async def get_dvibot_empleado_id() -> int | None:
    global DVIBOT_EMPLEADO_ID
    if DVIBOT_EMPLEADO_ID is not None:
        return DVIBOT_EMPLEADO_ID
    id_env = os.getenv("DVI_BOT_EMPLEADO_ID")
    if id_env:
        try:
            DVIBOT_EMPLEADO_ID = int(id_env)
            return DVIBOT_EMPLEADO_ID
        except (ValueError, TypeError):
            pass
    empleados = await listar_empleados()
    if isinstance(empleados, list):
        for e in empleados:
            if e.get("nombre", "").lower() == "dvibot":
                DVIBOT_EMPLEADO_ID = e.get("idEmpleado")
                return DVIBOT_EMPLEADO_ID
    return None

# Dashboard
async def get_stats() -> dict:
    return await _get("dashboard/stats")

# Habitaciones
async def listar_habitaciones() -> list:
    return await _get("habitaciones")

async def listar_habitaciones_disponibles() -> list:
    habs = await _get("habitaciones")
    if isinstance(habs, dict) and "error" in habs:
        return habs
    if not isinstance(habs, list):
        return []
    return [h for h in habs if h.get("estado") == "DISPONIBLE"]

async def listar_habitaciones_disponibles_por_fechas(ingreso: str, salida: str) -> list:
    if not ingreso or not salida:
        return {"error": "Fechas requeridas"}
    return await _get_with_params(
        "habitaciones/disponibles",
        {"fechaIngreso": ingreso, "fechaSalida": salida}
    )

async def actualizar_estado_habitacion(id: int, estado: str) -> dict:
    if not id or not estado:
        return {"error": "id y estado requeridos"}
    hab = await _get(f"habitaciones/{id}")
    if isinstance(hab, dict) and "error" in hab:
        return hab
    hab["estado"] = estado
    return await _put(f"habitaciones/{id}", hab)

# Clientes
async def listar_clientes() -> list:
    return await _get("clientes")

async def buscar_cliente(id: int) -> dict:
    if not id:
        return {"error": "id requerido"}
    return await _get(f"clientes/{id}")

async def crear_cliente(
    nombre: str,
    apellido_paterno: str,
    apellido_materno: str,
    dni: str,
    telefono: str,
    email: str = "",
) -> dict:
    if not dni or len(dni) != 8:
        return {"error": "DNI invalido"}
    if not telefono or len(telefono) < 9:
        return {"error": "Telefono invalido"}
    return await _post("clientes", {
        "nombre": nombre,
        "apellidoPaterno": apellido_paterno,
        "apellidoMaterno": apellido_materno,
        "dni": dni,
        "telefono": telefono,
        "email": email or None,
    })

# Reservas
async def listar_reservas() -> list:
    return await _get("reservas")

async def buscar_reserva(id: int) -> dict:
    if not id:
        return {"error": "id requerido"}
    return await _get(f"reservas/{id}")

async def crear_reserva(
    id_cliente: int,
    id_habitacion: int,
    fecha_reserva: str,
    fecha_ingreso: str,
    fecha_salida: str,
    id_empleado: int = None,
) -> dict:
    if not id_cliente:
        return {"error": "Cliente requerido"}
    if not id_habitacion:
        return {"error": "Habitacion requerida"}
    if not fecha_ingreso or not fecha_salida:
        return {"error": "Fechas requeridas"}
    payload = {
        "cliente": {"idCliente": id_cliente},
        "habitacion": {"idHabitacion": id_habitacion},
        "fechaReserva": fecha_reserva,
        "fechaIngreso": fecha_ingreso,
        "fechaSalida": fecha_salida,
        "estadoReserva": "PENDIENTE",
    }
    if id_empleado:
        payload["empleado"] = {"idEmpleado": id_empleado}
    return await _post("reservas", payload)

async def cancelar_reserva(id: int) -> dict:
    if not id:
        return {"error": "id requerido"}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.patch(f"{BASE}/api/reservas/{id}/cancelar")
            r.raise_for_status()
            return r.json()
        except httpx.HTTPError as e:
            return {"error": str(e)}

async def checkin_reserva(id: int) -> dict:
    if not id:
        return {"error": "id requerido"}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.patch(f"{BASE}/api/reservas/{id}/checkin")
            r.raise_for_status()
            return r.json()
        except httpx.HTTPError as e:
            return {"error": str(e)}

async def checkout_reserva(id: int) -> dict:
    if not id:
        return {"error": "id requerido"}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.patch(f"{BASE}/api/reservas/{id}/checkout")
            r.raise_for_status()
            return r.json()
        except httpx.HTTPError as e:
            return {"error": str(e)}

# Pagos
async def listar_pagos() -> list:
    return await _get("pagos")

async def crear_pago(
    id_reserva: int,
    monto: float,
    fecha_pago: str,
    metodo_pago: str = "EFECTIVO",
) -> dict:
    if not id_reserva or not monto:
        return {"error": "Datos de pago requeridos"}
    return await _post("pagos", {
        "reserva": {"idReserva": id_reserva},
        "monto": monto,
        "fechaPago": fecha_pago,
        "metodoPago": metodo_pago,
    })

# Empleados
async def listar_empleados() -> list:
    return await _get("empleados")

# Tipos de habitacion
async def listar_tipos_habitacion() -> list:
    return await _get("tipos-habitacion")

# RENIEC
async def consultar_dni(dni: str) -> dict:
    if not dni:
        return {"error": "DNI requerido"}
    return await _get(f"reniec/dni/{dni}")

# Horarios
async def listar_horarios() -> list:
    return await _get("horarios")

async def horarios_en_curso() -> list:
    return await _get("horarios/en-curso")
