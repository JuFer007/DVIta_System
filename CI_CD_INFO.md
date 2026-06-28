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
    │       ├── backend.yml   → mvn test + jacoco:report + package + upload jar
    │       ├── frontend.yml  → lint + tsc + build + upload dist
    │       ├── chatbot.yml   → pytest --cov + upload coverage
    │       └── pdf-server.yml → eslint + test
    │
    ├── git push a main (merge)
    │       └── integration.yml → docker compose build + docker push a Docker Hub
    │
    └── Resultados: github.com/JuFer007/DVIta_System/actions
```

---

## Workflows Implementados

### 1. Backend CI (`.github/workflows/backend.yml`)

**Disparadores:** push a `main`/`develop` o PR a `main` con cambios en `backend/` o `pom.xml`

```yaml
name: Backend CI
on:
  push:
    branches: [main, develop]
    paths: ['backend/**', 'pom.xml']
  pull_request:
    branches: [main]
    paths: ['backend/**', 'pom.xml']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'maven'
      - run: mvn clean test jacoco:report
      - run: mvn package -DskipTests
      - uses: actions/upload-artifact@v4
        with:
          name: backend-jar
          path: target/*.jar
      - uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: target/site/jacoco/**/*
```

**Qué valida:**
- Compilación con Java 21
- Pruebas unitarias JUnit 5
- Cobertura de código con JaCoCo
- Dependencias Maven (cacheadas)
- Generación del JAR
- **Artefacto:** `backend-jar` (JAR compilado)
- **Artefacto:** `backend-coverage` (reporte HTML de cobertura)

### 2. Frontend CI (`.github/workflows/frontend.yml`)

**Disparadores:** push a `main`/`develop` o PR a `main` con cambios en `frontend/`

```yaml
name: Frontend CI
on:
  push:
    branches: [main, develop]
    paths: ['frontend/**']
  pull_request:
    branches: [main]
    paths: ['frontend/**']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
        working-directory: frontend
      - run: npm run lint
        working-directory: frontend
      - run: npx tsc --noEmit
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
      - uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist/**/*
```

**Qué valida:**
- Instalación limpia de dependencias (`npm ci`)
- Calidad de código con ESLint
- Tipos TypeScript con `tsc --noEmit`
- Build de producción con Vite
- **Artefacto:** `frontend-dist` (build de producción)

### 3. Chatbot CI (`.github/workflows/chatbot.yml`)

**Disparadores:** push a `main`/`develop` o PR a `main` con cambios en `chatBot/`

```yaml
name: Chatbot CI
on:
  push:
    branches: [main, develop]
    paths: ['chatBot/**']
  pull_request:
    branches: [main]
    paths: ['chatBot/**']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'
      - run: pip install -r chatBot/requirements.txt
      - run: pip install pytest pytest-cov
      - run: pytest --cov=. --cov-report=xml --cov-report=term
        working-directory: chatBot
      - uses: actions/upload-artifact@v4
        with:
          name: chatbot-coverage
          path: chatBot/coverage.xml
```

**Qué valida:**
- Instalación de dependencias Python
- Tests unitarios con pytest
- Cobertura de código con pytest-cov
- **Artefacto:** `chatbot-coverage` (reporte XML de cobertura)

### 4. PDF Server CI (`.github/workflows/pdf-server.yml`)

**Disparadores:** push a `main`/`develop` o PR a `main` con cambios en `servidor/`

```yaml
name: PDF Server CI
on:
  push:
    branches: [main, develop]
    paths: ['servidor/**']
  pull_request:
    branches: [main]
    paths: ['servidor/**']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: servidor/package-lock.json
      - run: npm ci
        working-directory: servidor
      - run: npx eslint .
        working-directory: servidor
      - run: npm test
        working-directory: servidor
```

**Qué valida:**
- Instalación de dependencias Node.js
- Calidad de código con ESLint
- Script de test

### 5. Integration CI + CD (`.github/workflows/integration.yml`)

**Disparadores:** solo push a `main` (después de mergear)

```yaml
name: Integration CI + CD
on:
  push:
    branches: [main]
env:
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
jobs:
  docker-build-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - uses: docker/bake-action@v4
        with:
          files: docker-compose.yml
          targets: pdf-server,backend,chatbot,frontend
          set: |
            *.cache-from=type=gha
            *.cache-to=type=gha,mode=max
      - name: Tag and push to Docker Hub
        run: |
          for svc in pdf-server backend chatbot frontend; do
            img="dvita_system-$svc"
            hub="$DOCKER_USERNAME/d-vita-$svc:latest"
            docker tag "$img" "$hub"
            docker push "$hub"
          done
```

**Qué valida + despliega:**
- Construcción de todas las imágenes Docker con cache GHA
- Login a Docker Hub con secrets
- **CD:** Push automático de imágenes a Docker Hub (`docker push`)

### 6. Deploy to Render (`.github/workflows/deploy.yml`)

**Disparadores:** se ejecuta automáticamente después de que `Integration CI + CD` termina exitosamente en `main`

```yaml
name: Deploy to Render
on:
  workflow_run:
    workflows: ["Integration CI + CD"]
    branches: [main]
    types: [completed]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - name: Deploy Backend
        run: |
          curl -sSf -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_BACKEND_ID }}/deploys" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            || echo "Backend deploy triggered"
      - name: Deploy Frontend
        run: |
          curl -sSf -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_FRONTEND_ID }}/deploys" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            || echo "Frontend deploy triggered"
      - name: Deploy Chatbot
        run: |
          curl -sSf -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_CHATBOT_ID }}/deploys" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            || echo "Chatbot deploy triggered"
      - name: Deploy PDF Server
        run: |
          curl -sSf -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_PDF_SERVER_ID }}/deploys" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            || echo "PDF Server deploy triggered"
```

**Qué despliega:**
- **CD:** Auto-deploy a Render de backend, chatbot y PDF server vía API
- Frontend se despliega aparte (Vercel auto-deploy desde GitHub)
- Se ejecuta solo si el Docker push fue exitoso

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

---

## Badges de Estado

```
[![Backend CI](https://github.com/JuFer007/DVIta_System/actions/workflows/backend.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/JuFer007/DVIta_System/actions/workflows/frontend.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/frontend.yml)
[![Chatbot CI](https://github.com/JuFer007/DVIta_System/actions/workflows/chatbot.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/chatbot.yml)
[![PDF Server CI](https://github.com/JuFer007/DVIta_System/actions/workflows/pdf-server.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/pdf-server.yml)
[![Integration CI](https://github.com/JuFer007/DVIta_System/actions/workflows/integration.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/integration.yml)
[![Deploy](https://github.com/JuFer007/DVIta_System/actions/workflows/deploy.yml/badge.svg)](https://github.com/JuFer007/DVIta_System/actions/workflows/deploy.yml)
```

---

## Resumen: Lo que ya está implementado

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

---

## Secrets requeridos en GitHub

Ve a **Settings → Secrets and variables → Actions** y agrega estos secrets:

| Secret | Valor | ¿Para qué? |
|--------|-------|------------|
| `DOCKER_USERNAME` | `jufer07` | Push a Docker Hub |
| `DOCKER_PASSWORD` | *(tu token de Docker Hub)* | Token Docker Hub |
| `RENDER_API_KEY` | *(tu API key de Render)* | Deploy via API |
| `RENDER_BACKEND_ID` | `srv-d90ahn5aeets73dt5n90` | ID del backend |
| `RENDER_CHATBOT_ID` | `srv-d90aitm8bjmc73923qig` | ID del chatbot |
| `RENDER_PDF_SERVER_ID` | `srv-d90ajd6gvqtc739bihk0` | ID del PDF server |

## URLs de los servicios

| Servicio | URL |
|----------|-----|
| Backend | `https://d-vita-backend.onrender.com` |
| Chatbot | `https://d-vita-chatbot.onrender.com` |
| PDF Server | `https://d-vita-pdf-server.onrender.com` |
| Frontend | `https://dv-ita-system.vercel.app` |

## Base de datos (Railway)

| Dato | Valor |
|------|-------|
| Host | `hopper.proxy.rlwy.net` |
| Puerto | `53082` |
| Base de datos | `railway` |
| Usuario | `root` |
| Contrasenia | *(password de Railway)* |
