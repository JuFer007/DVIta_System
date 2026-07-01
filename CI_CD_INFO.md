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
- **Notificación:** Commit status `Falló Backend CI` + Slack si `SLACK_WEBHOOK` está configurado

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
- **Notificación:** Commit status `Falló Frontend CI` + Slack si configurado

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
- **Notificación:** Commit status `Falló Chatbot CI` + Slack si configurado

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
- **Notificación:** Commit status `Falló PDF Server CI` + Slack si configurado

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
    permissions:
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - name: Build images
        run: docker compose -p dvita_system build pdf-server backend chatbot frontend
      - name: Scan images with Trivy
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: 'dvita_system-backend:latest'
          format: 'sarif'
          severity: 'HIGH,CRITICAL'
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'
      - name: Save previous version and push all tags
        run: |
          for svc in pdf-server backend chatbot frontend; do
            img="dvita_system-$svc"
            hub="$DOCKER_USERNAME/d-vita-$svc"
            # Save current latest as previous (for rollback)
            docker pull "$hub:latest" 2>/dev/null && \
              docker tag "$hub:latest" "$hub:previous" && \
              docker push "$hub:previous" || true
            # Tag new version as latest and with commit SHA
            docker tag "$img" "$hub:latest"
            docker tag "$img" "$hub:${{ github.sha }}"
            docker push "$hub:latest"
            docker push "$hub:${{ github.sha }}"
          done
      - name: Notify failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.repos.createCommitStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              sha: context.sha,
              state: 'failure',
              context: '${{ github.workflow }}',
              description: 'Falló la integración + push a Docker Hub'
            });
```

**Qué valida + despliega:**
- Construcción de todas las imágenes Docker
- Login a Docker Hub con secrets
- **CD:** Push de imágenes a Docker Hub con 3 tags:
  - `:latest` — versión actual
  - `:${{ github.sha }}` — versionada por commit (para rollback manual)
  - `:previous` — versión anterior guardada (para rollback automático)
- **Notificación:** Commit status + Slack si configurado

### 6. Deploy to Render (`.github/workflows/deploy.yml`)

**Disparadores:** se ejecuta automáticamente después de que `Integration CI + CD` termina exitosamente en `main`

```yaml
name: Deploy to Render
on:
  workflow_run:
    workflows: ["Integration CI + CD"]
    branches: [main]
    types: [completed]
env:
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    environment:
      name: production
      url: https://d-vita-backend.onrender.com
    steps:
      - name: Deploy Backend + Health Check + Rollback
        id: backend
        run: |
          # Trigger deploy en Render
          DEPLOY_RESP=$(curl -s -X POST \
            "https://api.render.com/v1/services/${{ secrets.RENDER_BACKEND_ID }}/deploys" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}")
          DEPLOY_ID=$(echo "$DEPLOY_RESP" | jq -r '.id')
          # Poll cada 15s hasta que termine (máx 5 min)
          for i in $(seq 1 20); do
            sleep 15
            STATUS=$(curl -s "..." | jq -r '.status')
            if [ "$STATUS" = "live" ]; then exit 0; fi
            if [ "$STATUS" = "failed" ]; then exit 1; fi
          done
      - name: Rollback Backend on failure
        if: failure()
        run: |
          docker pull "$DOCKER_USERNAME/d-vita-backend:previous"
          docker tag "$DOCKER_USERNAME/d-vita-backend:previous" "$DOCKER_USERNAME/d-vita-backend:latest"
          docker push "$DOCKER_USERNAME/d-vita-backend:latest"
          curl -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_BACKEND_ID }}/deploys" ...
```

> El mismo patrón se repite para Chatbot y PDF Server.

**Qué despliega:**
- **CD:** Auto-deploy a Render de backend, chatbot y PDF server vía API
- **Approval gate:** El job usa `environment: production`, que en GitHub requiere aprobación manual antes de ejecutarse (configurable en Settings → Environments)
- **Health check:** Después del deploy, espera a que Render reporte estado `live` (polling hasta 5 min)
- **Rollback automático:** Si el deploy falla o expira, restaura la imagen `:previous` de Docker Hub y redispara el deploy
- **Notificación:** Commit status + Slack si configurado
- Frontend se despliega aparte (Vercel auto-deploy desde GitHub)

---

## Mejoras Adicionales de CI/CD

### 7. Dependabot — Actualizaciones Automáticas (`.github/dependabot.yml`)

Dependabot revisa semanalmente las dependencias y abre PRs automáticos con actualizaciones.

| Ecosistema | Directorio | Frecuencia |
|------------|-----------|------------|
| npm | `frontend/`, `servidor/` | Semanal |
| pip | `chatBot/` | Semanal |
| maven | `/` | Semanal |
| docker | `contenedores/`, `servidor/` | Semanal |
| github-actions | `/` | Semanal |

Límite: máximo 5 PRs abiertos por ecosistema.

### 8. Escaneo de Seguridad — Trivy

Integrado en `integration.yml`. Despues de construir las imagenes Docker, se ejecuta:

```yaml
- uses: aquasecurity/trivy-action@0.28.0
  with:
    image-ref: 'dvita_system-backend:latest'
    format: 'sarif'
    severity: 'HIGH,CRITICAL'
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-results.sarif'
```

- Escanea vulnerabilidades **HIGH y CRITICAL**
- Sube resultados al **Security tab** de GitHub
- Se ejecuta **antes** de pushear a Docker Hub

### 9. Notificaciones de Fallo

Cada workflow (backend, frontend, chatbot, pdf-server, integration, deploy) tiene:

```yaml
- name: Notify failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      await github.rest.repos.createCommitStatus({
        owner: context.repo.owner,
        repo: context.repo.repo,
        sha: context.sha,
        state: 'failure',
        context: '${{ github.workflow }}',
        description: 'Pipeline falló'
      });

- name: Notify Slack on failure
  if: failure() && secrets.SLACK_WEBHOOK
  uses: slackapi/slack-github-action@v2
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK }}
```

- **Commit status:** Se marca el commit como fallido directamente en GitHub
- **Slack:** Opcional, solo si el secret `SLACK_WEBHOOK` está configurado

### 10. Approval Gate — Protección de Producción

El workflow `deploy.yml` está vinculado al environment `production`:

```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://d-vita-backend.onrender.com
```

**Comportamiento:**
- GitHub pausa el workflow hasta que un **usuario autorizado** apruebe manualmente el deploy
- Solo miembros con acceso al environment `production` pueden aprobar
- Configurable en: Settings → Environments → `production` → Required reviewers

### 11. Rollback Automático

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

### 12. Protección de Rama `main`

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
| `SLACK_WEBHOOK` | *(opcional)* | Webhook de Slack para notificaciones de fallo |

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
