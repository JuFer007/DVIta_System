from dataclasses import dataclass, field

@dataclass
class ConversationContext:
    dni: str | None = None
    nombre_cliente: str = ""
    id_cliente: int | None = None
    telefono: str = ""
    wizard_step: str | None = None
    wizard_data: dict = field(default_factory=dict)
    pending_action: str | None = None
    pending_data: dict = field(default_factory=dict)
    menu_path: list = field(default_factory=list)

    def is_identified(self) -> bool:
        return self.id_cliente is not None

    def set_cliente(self, dni: str, nombre: str, id_cliente: int, telefono: str = ""):
        self.dni = dni
        self.nombre_cliente = nombre
        self.id_cliente = id_cliente
        self.telefono = telefono

    def reset(self):
        self.dni = None
        self.nombre_cliente = ""
        self.id_cliente = None
        self.telefono = ""
        self.clear_wizard()
        self.clear_pending()
        self.menu_path = []

    # menu navigation

    def push_menu(self, name: str):
        self.menu_path.append(name)

    def pop_menu(self) -> str | None:
        if self.menu_path:
            return self.menu_path.pop()
        return None

    def current_menu(self) -> str:
        return self.menu_path[-1] if self.menu_path else ""

    def is_in_menu(self) -> bool:
        return len(self.menu_path) > 0

    # wizard (registro / reserva)

    def start_wizard(self, step: str, data: dict | None = None):
        self.wizard_step = step
        self.wizard_data = data or {}

    def advance_wizard(self, next_step: str, data: dict | None = None):
        if data:
            self.wizard_data.update(data)
        self.wizard_step = next_step

    def clear_wizard(self):
        self.wizard_step = None
        self.wizard_data = {}

    # pending action (confirmaciones)

    def set_pending(self, action: str, data: dict):
        self.pending_action = action
        self.pending_data = data

    def clear_pending(self):
        self.pending_action = None
        self.pending_data = {}

    def to_llm_context(self) -> str:
        lines = []
        if self.is_identified():
            lines.append(f"Usuario: {self.nombre_cliente} (identificado, DNI: {self.dni})")
        elif self.dni:
            lines.append(f"DNI proporcionado: {self.dni} (aun no registrado)")
        else:
            lines.append("Cliente no identificado")

        if self.is_in_menu():
            lines.append(f"Menu actual: {self.current_menu()}")
            lines.append(f"Ruta del menu: {' > '.join(self.menu_path)}")
        if self.wizard_step:
            lines.append(f"Wizard activo: {self.wizard_step}")
        if self.pending_action:
            lines.append(f"Accion pendiente: {self.pending_action}")

        return " | ".join(lines) if lines else "Sin contexto"

_sessions: dict[str, ConversationContext] = {}

def get_context(session_id: str) -> ConversationContext:
    if session_id not in _sessions:
        _sessions[session_id] = ConversationContext()
    return _sessions[session_id]

def clear_session(session_id: str):
    _sessions.pop(session_id, None)
