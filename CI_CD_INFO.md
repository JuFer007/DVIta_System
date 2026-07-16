# Integración Continua — D'Vita System

## Arquitectura del Proyecto

| Servicio | Tecnología |
|----------|-----------|
| **Backend** | Spring Boot 4.0.5 / Java 21 + Maven |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Chatbot** | FastAPI + Python 3.12 + Ollama |
| **PDF Server** | Express.js + Node 20 + Puppeteer |
| **Base de Datos** | MySQL 8.0 |
| **Orquestación** | Docker Compose |

---

## Plataforma de CI: GitHub Actions

GitHub Actions ejecuta pipelines automáticos en cada `git push` o `pull request`.

```
Desarrollador
    │
    ├── git push a develop
    │       ├── backend.yml    → mvn test + jacoco:report + package + upload jar
    │       ├── frontend.yml   → lint + tsc + build + upload dist
    │       ├── chatbot.yml    → pytest --cov + upload coverage
    │       └── pdf-server.yml → eslint + test
    │       └── [todos]        → Notify failure (commit status + Slack si configurado)
    │
    ├── git push a main (merge con PR + approval)
    │       ├── integration.yml → docker compose build + Trivy scan + push a Docker Hub (SHA + latest + previous)
    │       ├── deploy.yml      → environment:production (aprobación manual) → deploy + health check
    │       │                     └── si falla → rollback automático a imagen "previous"
    │       └── [todos]         → Notify failure
    │
    ├── schedule (cada 10 min)
    │       └── keep-alive.yml  → ping a servicios Render + notificación si falla
    │
    ├── Dependabot (semanal)
    │       └── PRs automáticos con actualizaciones de dependencias
    │
    └── Resultados: github.com/JuFer007/DVIta_System/actions
```

---

## Workflows Implementados

### 1. Backend CI (`.github/workflows/backend.yml`)

**Disparadores:** push a `main`/`develop` o PR a `main` con cambios en `backend/` o `pom.xml`

**Qué valida:**
- Compilación con Java 21
- Pruebas unitarias JUnit 5
- Cobertura de código con JaCoCo
- Dependencias Maven (cacheadas)
- Generación del JAR
- **Artefacto:** `backend-jar` (JAR compilado)
- **Artefacto:** `backend-coverage` (reporte HTML de cobertura)
- **Notificación:** Commit status + Slack si configurado

### 2. Frontend CI (`.github/workflows/frontend.yml`)

**Disparadores:** push a `main`/`develop` o PR a `main` con cambios en `frontend/`

**Qué valida:**
- Instalación limpia de dependencias (`npm ci`)
- Calidad de código con ESLint
- Tipos TypeScript con `tsc --noEmit`
- Build de producción con Vite
- **Artefacto:** `frontend-dist` (build de producción)
- **Notificación:** Commit status + Slack si configurado

### 3. Chatbot CI (`.github/workflows/chatbot.yml`)

**Disparadores:** push a `main`/`develop` o PR a `main` con cambios en `chatBot/`

**Qué valida:**
- Instalación de dependencias Python
- Tests unitarios con pytest
- Cobertura de código con pytest-cov
- **Artefacto:** `chatbot-coverage` (reporte XML de cobertura)
- **Notificación:** Commit status + Slack si configurado

### 4. PDF Server CI (`.github/workflows/pdf-server.yml`)

**Disparadores:** push a `main`/`develop` o PR a `main` con cambios en `servidor/`

**Qué valida:**
- Instalación de dependencias Node.js
- Calidad de código con ESLint
- Script de test
- **Notificación:** Commit status + Slack si configurado

### 5. Integration CI + CD (`.github/workflows/integration.yml`)

**Disparadores:** solo push a `main` (después de mergear)

**Qué valida + despliega:**
- Construcción de todas las imágenes Docker
- Login a Docker Hub (mediante secrets configurados en GitHub)
- **CD:** Push de imágenes a Docker Hub con 3 tags:
  - `:latest` — versión actual
  - `:${{ github.sha }}` — versionada por commit (para rollback manual)
  - `:previous` — versión anterior guardada (para rollback automático)
- **Notificación:** Commit status + Slack si configurado

### 6. Deploy to Render (`.github/workflows/deploy.yml`)

**Disparadores:** se ejecuta automáticamente después de que `Integration CI + CD` termina exitosamente en `main`

**Qué despliega:**
- **CD:** Auto-deploy a Render de backend, chatbot y PDF server vía API
- **Approval gate:** El job usa `environment: production`, que en GitHub requiere aprobación manual antes de ejecutarse (configurable en Settings → Environments)
- **Health check:** Después del deploy, espera a que Render reporte estado `live` (polling hasta 5 min)
- **Rollback automático:** Si el deploy falla o expira, restaura la imagen `:previous` de Docker Hub y redispara el deploy
- **Notificación:** Commit status + Slack si configurado
- Frontend se despliega aparte (Vercel auto-deploy desde GitHub)

### 7. Keep Alive (`.github/workflows/keep-alive.yml`)

**Disparadores:** cada 10 minutos (schedule cron)

**Qué hace:**
- Ping a los servicios en Render para evitar que se duerman (free tier)
- Notificación si algún servicio no responde

---

## Mejoras Adicionales de CI/CD

### Dependabot — Actualizaciones Automáticas (`.github/dependabot.yml`)

Dependabot revisa semanalmente las dependencias y abre PRs automáticos con actualizaciones.

| Ecosistema | Directorio | Frecuencia |
|------------|-----------|------------|
| npm | `frontend/`, `servidor/` | Semanal |
| pip | `chatBot/` | Semanal |
| maven | `/` | Semanal |
| docker | `contenedores/`, `servidor/` | Semanal |
| github-actions | `/` | Semanal |

Límite: máximo 5 PRs abiertos por ecosistema.

### Escaneo de Seguridad — Trivy

Integrado en `integration.yml`. Después de construir las imágenes Docker, se ejecuta un escaneo de vulnerabilidades:
- Escanea vulnerabilidades **HIGH y CRITICAL**
- Sube resultados al **Security tab** de GitHub
- Se ejecuta **antes** de pushear a Docker Hub

### Notificaciones de Fallo

Cada workflow tiene notificación de fallo mediante commit status en GitHub y Slack (opcional).

### Approval Gate — Protección de Producción

El workflow `deploy.yml` está vinculado al environment `production`:
- GitHub pausa el workflow hasta que un **usuario autorizado** apruebe manualmente el deploy
- Solo miembros con acceso al environment `production` pueden aprobar
- Configurable en: Settings → Environments → `production` → Required reviewers

### Rollback Automático

Cuando el `deploy.yml` detecta que un deploy falló (o expiró el timeout):
1. **Detección:** Polling al API de Render cada 15s (hasta 5 min)
2. **Restauración:** `docker pull` de la imagen `:previous` → retag como `:latest` → `docker push`
3. **Redeploy:** Dispara un nuevo deploy en Render con la imagen anterior
4. **Notificación:** Commit status y Slack informan del rollback

Las imágenes en Docker Hub mantienen 3 tags:
| Tag | Propósito |
|-----|-----------|
| `:latest` | Versión actual en producción |
| `:${{ github.sha }}` | Versionada por commit (rollback manual) |
| `:previous` | Versión anterior (rollback automático) |

### Protección de Rama `main`

Configurar en **Settings → Branches → Add branch protection rule**:

| Regla | Recomendado |
|-------|-------------|
| Require a pull request before merging | ✅ Sí |
| Require approvals | 1 approval |
| Dismiss stale pull request approvals | ✅ Sí |
| Require status checks to pass | ✅ backend, frontend, chatbot, pdf-server CI |
| Require branches to be up to date | ✅ Sí |
| Do not allow bypassing | ✅ Sí |

---

## Archivos de Test y Configuración Creados

### Backend (Spring Boot)

| Archivo | Propósito |
|---------|-----------|
| `backend/src/test/java/.../ApplicationTests.java` | Test de carga de contexto Spring Boot con perfil `test` |
| `backend/src/test/resources/application-test.properties` | Configuración con H2 en memoria para tests |
| `pom.xml` (modificado) | Agregada dependencia `com.h2database:h2` scope `test` + plugin `jacoco` |

### Frontend (React + TypeScript)

| Archivo | Propósito |
|---------|-----------|
| `frontend/.eslintrc.cjs` | Configuración ESLint con reglas para React + TypeScript |
| `frontend/package.json` (modificado) | Scripts `lint` y `typecheck` agregados; devDependencies de ESLint |

### Chatbot (Python/FastAPI)

| Archivo | Propósito |
|---------|-----------|
| `chatBot/tests/__init__.py` | Marca el directorio como paquete Python |
| `chatBot/tests/conftest.py` | Fixtures compartidos para tests |
| `chatBot/tests/test_intent_detector.py` | 15 tests unitarios para detección de intenciones |
| `chatBot/tests/test_date_parser.py` | 15 tests unitarios para parser de fechas en español |
| `chatBot/requirements.txt` (modificado) | Agregado `pytest==8.2.0` |

### PDF Server (Node.js/Express)

| Archivo | Propósito |
|---------|-----------|
| `servidor/.eslintrc.json` | Configuración ESLint para Node.js |
| `servidor/package.json` (modificado) | Scripts `test` y `lint` agregados; devDependency `eslint` |

---

## Herramientas de Integración Continua — Tabla Resumen

| Herramienta | Función en el proyecto |
|-------------|----------------------|
| **GitHub Actions** | Orquestador de CI/CD: ejecuta pipelines automáticos en cada push/PR |
| **Maven** | Build y gestión de dependencias del backend Spring Boot |
| **JUnit 5** | Framework de pruebas unitarias para Java/Spring Boot |
| **JaCoCo** | Generación de reportes de cobertura de código del backend |
| **H2 Database** | Base de datos en memoria para ejecutar tests del backend sin MySQL |
| **ESLint** | Análisis estático de calidad del código (frontend + PDF server) |
| **TypeScript (tsc)** | Verificación de tipos en el frontend |
| **pytest + pytest-cov** | Framework de pruebas + cobertura para el chatbot Python |
| **Docker Compose** | Validación de construcción de todos los contenedores del sistema |
| **Docker Hub** | Registro de imágenes para despliegue continuo (CD) |
| **upload-artifact** | Almacenamiento de JAR, builds y reportes de cobertura como artefactos |
| **Trivy** | Escaneo de vulnerabilidades en imagenes Docker (HIGH/CRITICAL) |
| **Dependabot** | PRs automáticos semanales para mantener dependencias actualizadas |
| **github-script** | Notificaciones de fallo como commit status en GitHub |
| **Slack GitHub Action** | Notificaciones opcionales a Slack cuando un pipeline falla |

---

## Badges de Estado

```
[![Backend CI](https://github.com/JuFer007/DVIta_System/actions/workflows/backend.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/JuFer007/DVIta_System/actions/workflows/frontend.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/frontend.yml)
[![Chatbot CI](https://github.com/JuFer007/DVIta_System/actions/workflows/chatbot.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/chatbot.yml)
[![PDF Server CI](https://github.com/JuFer007/DVIta_System/actions/workflows/pdf-server.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/pdf-server.yml)
[![Integration CI](https://github.com/JuFer007/DVIta_System/actions/workflows/integration.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/integration.yml)
[![Deploy](https://github.com/JuFer007/DVIta_System/actions/workflows/deploy.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/deploy.yml)
[![Dependabot](https://img.shields.io/badge/Dependabat-active-025E8C?logo=dependabot)](https://github.com/JuFer007/DVIta_System/security/dependabot)
```

---

## Resumen: Lo implementado

| Mejora | Estado |
|--------|--------|
| CI multi-servicio | `backend.yml`, `frontend.yml`, `chatbot.yml`, `pdf-server.yml` |
| Cache de dependencias | Maven, npm, pip |
| Docker layer caching | `docker/bake-action@v4` con `cache-from=type=gha` |
| Artefactos (JAR, dist, coverage) | `upload-artifact` en backend, frontend y chatbot |
| Cobertura de código | JaCoCo (backend) + pytest-cov (chatbot) |
| Quality gate | JaCoCo check con mínimo 30% de cobertura de línea |
| CD (Docker Hub) | `integration.yml` hace `docker push` al mergear a `main` |
| CD (Render auto-deploy) | `deploy.yml` despliega backend, chatbot y PDF server vía API de Render (frontend en Vercel) |
| Keep alive (anti-sleep) | `keep-alive.yml` ping cada 10 min a los servicios en Render |
| Escaneo de seguridad | Trivy en `integration.yml` + Dependabot semanal |
| Notificaciones de fallo | Commit status + Slack opcional en todos los workflows |
| Approval gate | Environment `production` con reviewers en `deploy.yml` |
| Rollback automático | Si deploy falla, restaura imagen `:previous` + redeploy |
| Protección rama `main` | PR + approval + status checks requeridos (Settings) |
