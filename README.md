<div align="center">
  <img src="frontend/public/DVita_Logo.png" alt="D'Vita System" width="100"/>
  <br><br>
  <p><strong>Sistema de gestión hotelera con reservas, administración de habitaciones, clientes, empleados, reportes y chatbot inteligente</strong></p>

  ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
  ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?logo=springboot&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
  ![Python](https://img.shields.io/badge/Python-FFD43B?logo=python&logoColor=3776AB)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
</div>

---

## Módulos

### Landing Page
Página principal con presentación del hospedaje, servicios y acceso al sistema.

| | |
|---|---|
| ![Landing 1](capturas/lading1.png) | ![Landing 2](capturas/lading2.png) |
| ![Landing 3](capturas/lading3.png) | ![Landing 4](capturas/lading4.png) |

### Autenticación
Inicio de sesión para recepcionistas y administradores.


![Login](capturas/login.png) 

### Dashboard
Panel principal con resumen de ocupación, reservas activas e ingresos.

![Dashboard](capturas/dashboard.png) 

### Gestión de Reservas
Creación, cancelación y consulta de reservas con wizard guiado.

| | |
|---|---|
| ![Reservas](capturas/reservas.png) | ![Nueva Reserva](capturas/nuevareserva.png) |

### Gestión de Habitaciones
Administración de habitaciones, tipos y precios.

| | |
|---|---|
| ![Habitaciones 1](capturas/habitaciones1.png) | ![Habitaciones 2](capturas/habitaciones2.png) |

### Gestión de Clientes
Registro y búsqueda de clientes con integración RENIEC.


 ![Clientes](capturas/clientes.png) 

### Gestión de Empleados
Administración del personal del hospedaje.


 ![Empleados](capturas/empleados.png)

### Usuarios del Sistema
Gestión de usuarios, roles y permisos.

![Usuarios](capturas/usuarios.png) 

### Pagos
Registro y consulta de pagos por reserva.

| | |
|---|---|
| ![Pagos](capturas/pagos.png) | ![Pagos 2](capturas/pagos1.png) |

### Reportes
Reportes de ocupación, ingresos y estadísticas.

| | |
|---|---|
| ![Reportes](capturas/reportes.png) | ![Reportes 2](capturas/reportes1.png) |

## Chatbot DViBot

Asistente virtual integrado en el frontend que permite a los huéspedes:

- Consultar disponibilidad de habitaciones
- Ver precios y servicios
- Crear, cancelar y consultar reservas
- Obtener información de contacto y ubicación
- Navegación por menús interactivos

---

## CI/CD

### GitHub Actions

| Workflow | Descripción | Trigger |
|---|---|---|
| **Backend CI** | `mvn clean test` + `mvn package` | Push a `main`/`develop` (cambios en `backend/` o `pom.xml`) |
| **Frontend CI** | `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run build` | Push a `main`/`develop` (cambios en `frontend/`) |
| **Chatbot CI** | Tests con pytest | Push a `main`/`develop` (cambios en `chatBot/`) |
| **PDF Server CI** | Tests del servidor Express | Push a `main`/`develop` (cambios en `pdfServer/`) |
| **Integration CI** | Verifica que todos los módulos compilen | Push a `main` |
| **Keep Alive** | Ping a `/api/actuator/health` cada 10 min | Schedule (cron) |

### Despliegue

| Servicio | Plataforma | Build | URL |
|---|---|---|---|
| Frontend | Vercel | Automático desde GitHub | `https://dvita-hospedaje.vercel.app` |
| Backend | Render | `mvn package` → `java -jar` | `https://d-vita-backend.onrender.com` |
| PDF Server | Render | Docker (Puppeteer) | `https://d-vita-pdf-server.onrender.com` |
| Chatbot | Render | `uvicorn main:app` | `https://d-vita-chatbot.onrender.com` |

### PDF Server (Puppeteer)

El servicio de PDF (`servidor/`) usa Puppeteer con Chromium. Para Render se incluye un `Dockerfile` que instala las dependencias del navegador:

```dockerfile
FROM node:20-slim
RUN apt-get install -y chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

**Al crear el Web Service en Render:**
- Runtime: **Docker**
- Root Directory: `servidor`
- Health Check Path: `/`

### Variables de Entorno

**Desarrollo local** (`.env.development`):
```
VITE_API_URL=http://localhost:8080
```

**Producción (Vercel)**: si no se define `VITE_API_URL`, el frontend usa rutas relativas `/api/*` y Vercel las redirige al backend en Render mediante `vercel.json`:

```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "https://d-vita-backend.onrender.com/api/$1" }]
}
```

Para usar llamadas directas al backend (sin rewrite), define `VITE_API_URL` como variable de entorno en el dashboard de Vercel.

### Keep Alive

Render en capa gratuita hiberna tras 15 min de inactividad. El workflow `keep-alive.yml` hace ping cada 10 min al health endpoint del backend y al chatbot para mantenerlos activos.

---

## Equipo

- **Marcelo Alarcón**
- **Jair Otero**
- **Oscar Santamaría**
- **Junior Zumaeta**
