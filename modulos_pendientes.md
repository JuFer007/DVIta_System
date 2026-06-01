# Módulos Pendientes de Completar

## ✅ Módulos Completos

| Módulo | Toasts | Validaciones | Acciones |
|--------|--------|-------------|----------|
| `ClientesPages.tsx` | ✅ | ✅ | ✅ |
| `EmpleadosPage.tsx` | ✅ | ✅ | ✅ |
| `HabitacionesPage.tsx` | ✅ | ✅ | ✅ |
| `TiposPage.tsx` | ✅ | ✅ | ✅ |
| `ReservaPage.tsx` | ✅ | ✅ | ✅ |

---

## ❌ Módulos por Terminar

### 1. PagosPages.tsx

- [ ] Importar `useToast`
- [ ] Toast success/fail en crear, actualizar, eliminar
- [ ] Validación frontend (monto > 0, fecha válida, reserva seleccionada)
- [ ] Hints en campos (monto, fecha, método de pago)
- [ ] Mensaje _"Esta acción no se puede deshacer."_ en `ConfirmModal`

### 2. UsuariosPages.tsx

- [ ] Importar `useToast`
- [ ] Toast success/fail en crear, actualizar, eliminar
- [ ] Validación frontend (usuario requerido, contraseña mínimo 8 caracteres)
- [ ] Mensaje _"Esta acción no se puede deshacer."_ en `ConfirmModal`

### 3. RecepcionistasPages.tsx

- [ ] Importar `useToast`
- [ ] Toast success/fail en crear, actualizar, eliminar
- [ ] Validación frontend (empleado requerido, turno seleccionado)
- [ ] Mensaje _"Esta acción no se puede deshacer."_ en `ConfirmModal`
- [ ] ⚠️ Revisar nombre del export (actualmente exporta como `UsuariosPage`)

### 4. AdministradoresPage.tsx

- [ ] Importar `useToast`
- [ ] Toast success/fail en crear, actualizar, eliminar
- [ ] Validación frontend (empleado requerido, email con formato válido)
- [ ] Hints en campos (email)
- [ ] Mensaje _"Esta acción no se puede deshacer."_ en `ConfirmModal`

### 5. HorariosPage.tsx

- [ ] Importar `useToast`
- [ ] Toast success/fail en crear, actualizar, eliminar
- [ ] Mensaje _"Esta acción no se puede deshacer."_ en su modal de confirmación
- [ ] ⚠️ Usa HTML table propio, no `DataTable`

---

## Notas

- `EntityPages.tsx` es un archivo antiguo que **no se importa en `App.tsx`** — puede eliminarse.
- Todos los módulos completos siguen el mismo patrón:
  - `useToast` + `toast.showToast("success"/"fail", título, detalle)`
  - Validación con `return` temprano y toast de error
  - `hint` en `ModalField`
  - `"Esta acción no se puede deshacer."` en `ConfirmModal`
