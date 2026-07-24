# eduplatform — vitalis Web

Frontend de **vitalis**, app personal de auto-seguimiento (peso, hábitos, métricas custom).
Next.js (App Router) + TypeScript + React.

## Estructura

```
src/
  app/                    # Rutas (App Router)
  features/
    metrics/
      components/         # UI de la feature
      services/           # Cliente HTTP hacia la API (samarya)
      types/              # Tipos del dominio en el front
  shared/
    lib/                  # api-client genérico
    components/           # Componentes compartidos entre features
```

## Levantar en local

Requiere la API (`samarya`) corriendo en `http://localhost:4000`.

```bash
cp .env.example .env
npm install
npm run dev   # http://localhost:3000
```
