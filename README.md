# 🗓️ Personal Assistant

Asistente personal para el día a día: planning semanal, hábitos, lista de la compra, recetario y ejercicio físico. Funciona como PWA instalable en iPhone sin coste de infraestructura.

## Estructura del repositorio

```
/
├── frontend/                    # React + TypeScript + Vite (PWA)
├── backend/                     # FastAPI (fase futura)
├── .pre-commit-config.yaml      # Hooks de calidad de código
├── .gitignore
├── CLAUDE.md                    # Instrucciones para Claude Code
└── README.md
```

## Stack actual

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| PWA | vite-plugin-pwa + Service Worker |
| Estilos | Tailwind CSS |
| Base de datos | Dexie.js (IndexedDB, local) |
| Estado UI | Zustand |
| Routing | React Router v6 |
| Hosting | Vercel (gratuito) |

## Funcionalidades

| Feature | Estado |
|---|---|
| Planning semanal | 🚧 En desarrollo |
| Seguimiento de hábitos | 🔜 Pendiente |
| Lista de la compra | 🔜 Pendiente |
| Recetario | 🔜 Pendiente |
| Rutinas de ejercicio | 🔜 Pendiente |

## Requisitos

- Node.js >= 20
- npm >= 10
- Python >= 3.12 *(solo cuando se añada el backend)*

## Desarrollo

```bash
cd frontend
npm install
npm run dev
```

Para probar en iPhone en la misma red WiFi:

```bash
cd frontend
npm run dev -- --host
# Abre http://<tu-ip-local>:5173 desde Safari en el iPhone
```

## Build

```bash
cd frontend
npm run build
npm run preview   # previsualiza el build con Service Worker activo
```

## Instalación como PWA en iPhone

1. Abrir la app en **Safari** (no Chrome ni Firefox)
2. Pulsar el botón de compartir (icono cuadrado con flecha)
3. Seleccionar **"Añadir a pantalla de inicio"**
4. La app se instalará con icono propio y funcionará sin barra de Safari

## Pre-commit hooks

```bash
# Instalar pre-commit (una sola vez)
pip install pre-commit
pre-commit install
pre-commit install --hook-type commit-msg   # para commitlint
```

## Despliegue

El frontend se despliega en **Vercel** apuntando a la carpeta `frontend/`:

```
Root Directory: frontend
Build Command:  npm run build
Output Dir:     dist
```

## Roadmap

- [x] Setup base PWA
- [ ] Weekly planning
- [ ] Habits tracker
- [ ] Shopping list + recetario
- [ ] Workout tracker
- [ ] Backend FastAPI (sync multi-dispositivo)