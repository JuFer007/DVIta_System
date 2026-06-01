# D'Vita System — Guía de Instalación

## 1. Base de datos

Ejecutar el script SQL para crear la base de datos y los datos iniciales:

```bash
mysql -u root -p < scripD'Vita.sql
```

---

## 2. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

El servidor se levanta en `http://localhost:8080`.

---

## 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

El frontend se levanta en `http://localhost:5173`.

---

## 4. Chatbot (Python + FastAPI)

```bash
cd chatBot
pip install -r requirements.txt
python main.py
```

El chatbot se levanta en `http://localhost:8000`.

> **Ollama** es opcional. Si no lo instalas, el chatbot funciona igual con respuestas predefinidas.

---

## 5. Orden de arranque

```
1. MySQL
2. Backend Java (puerto 8080)
3. Chatbot Python (puerto 8000)
4. Frontend React (puerto 5173)
```

---

## 6. Variables de entorno

El archivo `.env` en la raíz del proyecto debe contener como mínimo:

```env
BACKEND_URL=http://localhost:8080
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/DVita
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=123456
```

---

## 7. Probar el chatbot

### Desde el frontend

Abre `http://localhost:5173` y haz clic en el ícono de DViBot (esquina inferior derecha).

### Desde la terminal

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "menu", "session_id": "test1"}'
```

### Ejecutar pruebas automatizadas

```bash
cd chatBot
python test_suite/test_runner.py
```

Genera un reporte en `chatBot/test_suite/reporte_*.md`.

---

## 8. Estructura del proyecto

```
D'Vita System/
├── backend/               # API REST (Spring Boot)
│   └── src/main/java/com/systemWeb/DVita/
│       ├── Controller/    # Endpoints REST
│       ├── Model/         # Entidades JPA
│       ├── Repository/    # Acceso a datos
│       └── Service/       # Lógica de negocio
├── frontend/              # Aplicación web (React)
│   └── src/
│       ├── components/    # Componentes React
│       ├── pages/         # Páginas
│       └── services/      # Llamadas API
├── chatBot/               # Chatbot DViBot (Python)
│   ├── main.py            # Servidor FastAPI
│   ├── agent.py           # Orquestador de mensajes
│   ├── handlers.py        # Lógica de menús y reservas
│   ├── tools.py           # Conexión con backend Java
│   └── test_suite/        # Pruebas automatizadas
├── capturas/              # Capturas del sistema
├── scripD'Vita.sql        # Script de base de datos
└── .env                   # Variables de entorno
```
