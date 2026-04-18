# 🏨 Hospedaje D'Vita — Frontend

Sistema de gestión hotelera construido con React + Vite.

---

## 📁 Estructura del proyecto

```
dvita-frontend/
├── index.html
├── vite.config.js
├── package.json
├── PALETA_COLORES.md          ← Referencia de diseño
└── src/
    ├── main.jsx               ← Entrada de la app
    ├── App.jsx                ← Ruteador principal
    ├── App.module.css
    ├── index.css              ← Estilos globales + animaciones
    ├── tokens.css             ← Variables CSS (colores, tipografía, etc.)
    ├── context/
    │   └── AuthContext.jsx    ← Estado de autenticación
    ├── pages/
    │   ├── Login.jsx          ← Inicio de sesión
    │   ├── Login.module.css
    │   ├── Dashboard.jsx      ← Panel principal con estadísticas
    │   ├── Dashboard.module.css
    │   └── EntityPages.jsx    ← Clientes, Empleados, Habitaciones,
    │                            Tipos, Reservas, Pagos,
    │                            Usuarios, Recepcionistas, Admins
    └── components/
        ├── Sidebar.jsx        ← Menú lateral colapsable
        ├── Sidebar.module.css
        ├── Topbar.jsx         ← Barra superior con usuario y logout
        ├── Topbar.module.css
        ├── ChatBot.jsx        ← Botón flotante + panel de chat
        ├── ChatBot.module.css
        ├── DataTable.jsx      ← Tabla reutilizable con búsqueda
        ├── DataTable.module.css
        ├── StatsCard.jsx      ← Tarjetas de métricas
        └── StatsCard.module.css
```

---

## 🚀 Instalación y ejecución

### Requisitos
- Node.js 18+
- npm 9+

### Pasos

```bash
# 1. Entrar a la carpeta
cd dvita-frontend

# 2. Instalar dependencias
npm install

# 3. Levantar servidor de desarrollo
npm run dev
```

Abrir en el navegador: **http://localhost:5173**

### Credenciales de prueba
Cualquier usuario y contraseña (mínimo 1 carácter). El login es simulado.

---

## 🔗 Integración con Spring Boot

El proxy de Vite redirige `/api/*` → `http://localhost:8080`.

Para conectar los módulos al backend real, en `EntityPages.jsx` reemplaza
los arrays de datos por llamadas `fetch`:

```js
// Ejemplo: cargar clientes desde la API
const [clientes, setClientes] = useState([]);

useEffect(() => {
  fetch("/api/clientes")
    .then(r => r.json())
    .then(setClientes);
}, []);
```

---

## 🎨 Diseño

Ver **PALETA_COLORES.md** para la referencia completa de tokens de color,
tipografía y combinaciones recomendadas.

- **Color principal:** Terracota cálido `#B8622A`
- **Sidebar:** Café oscuro `#3D1F0A`
- **Fondo:** Gris neutro cálido `#F7F5F3`
- **Fuentes:** Playfair Display (títulos) + DM Sans (cuerpo)

---

## 📦 Build para producción

```bash
npm run build
# Los archivos quedan en /dist
```
