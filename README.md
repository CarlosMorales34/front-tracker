# eduplatform — vitalis Web

Frontend de **vitalis** ("Bienestar Integral" como copy de producto), app personal
de auto-medición: actividades diarias, registro semanal, finanzas, gastos y peso.
Next.js (App Router) + TypeScript + React. Consume la API en `samarya`.

## Estructura

```
src/
  app/                    # Rutas (App Router)
    layout.tsx            # ThemeProvider + AuthProvider + script anti-flash de tema
    page.tsx               # Landing pública
    login/ register/ forgot-password/
    dashboard/             # Home post-login (datos reales, GET /api/home/summary)
    actividades/ semanal/ finanzas/ gastos/ peso/ ajustes/
                            # Protegidas: redirigen a /login si no hay sesión
  features/
    auth/                 # LoginForm, RegisterForm, AuthContext, LogoutButton
    dashboard/            # Home post-login — datos reales (services/home.api.ts)
    metrics/               # Feature original de métricas genéricas
    activities/            # Actividades diarias (categorías, rutinas fijas, tabla semanal)
    finance/                # Finanzas (ingresos/gastos semanales, deuda, ahorro)
    expenses/               # Gastos diarios (variable + fijo mensual)
    weight/                 # Peso (registro mensual, tendencia, meta)
    weekly-log/             # Registro semanal (heatmap 52 semanas, contadores anuales)
    landing/                # Landing pública
  shared/
    lib/                   # api-client.ts, format-currency.ts, week.ts (semana sáb-vie)
    theme/                  # ThemeProvider (dark/light) + ThemeToggle
    components/
      layout/               # Sidebar (desktop), BottomTabBar (mobile), DashboardShell,
                             # TopNav (pre-login), AppShell (legacy, usado por /metrics)
      icons/                 # Íconos inline SVG genéricos (placeholder, sin logos de marca)
      ui/                    # Modal, EditableMoneyRow y ui.module.css — primitivas
                             # compartidas por Finanzas/Gastos/Peso/Registro semanal
```

Cada feature con datos reales sigue el mismo patrón: `types/` (contrato con la
API), `services/*.api.ts` (fetch con `Authorization: Bearer`), `components/`.

## Levantar en local

Requiere la API (`samarya`) corriendo en `http://localhost:4000`.

```bash
cp .env.example .env
npm install
npm run dev   # http://localhost:3000
```

## Auth (UI)

```
POST /api/auth/register  -> 201 { user, accessToken } + cookie httpOnly refresh_token
POST /api/auth/login     -> 200 { user, accessToken } + cookie httpOnly refresh_token
POST /api/auth/refresh   -> 200 { accessToken }        (usa la cookie)
POST /api/auth/logout    -> 204
```

- El `accessToken` vive solo en memoria (`AuthContext`), nunca en `localStorage` — el
  refresh token vive en la cookie httpOnly.
- Al montar la app, `AuthContext` intenta `POST /api/auth/refresh` para recuperar sesión
  silenciosamente; el usuario se deriva decodificando el JWT del `accessToken`
  (el token incluye `id`/`email`/`name`).
- Todas las rutas post-login (`/dashboard`, `/actividades`, `/semanal`, `/finanzas`,
  `/gastos`, `/peso`, `/ajustes`) redirigen a `/login` si no hay sesión.
- Botón "Cerrar sesión" en el Sidebar (desktop) y como ícono flotante en mobile
  (`shared/theme/ThemeToggle` + `features/auth/components/LogoutButton`).
- Botones "Continuar con Google/Apple": sin OAuth configurado, muestran un aviso
  "próximamente" sin fingir autenticación.

## Módulos con datos reales

Todos los módulos (Home, Actividades, Finanzas, Gastos, Peso y Registro semanal)
están conectados a endpoints reales de `samarya` (sin mock) — arrancan vacíos hasta
que el usuario captura datos. Cada card del Home trae su propio `hasData`; cuando es
`false` muestra un mensaje tipo "Estamos conociéndote para ayudarte a mejorar" en vez
de un 0 engañoso (ver `features/dashboard/components/*Card.tsx`).

Semana = sábado a viernes en toda la app (`shared/lib/week.ts`); "Registro semanal"
deriva su productividad/distribución de `activity_logs` (creados en `Actividades`),
pero como esa feature todavía no tiene UI para capturar horas por día, esas métricas
aparecen en 0%/vacío hasta que se agregue esa captura.

### Peso — meta configurable y patrones por año

La meta de peso tiene una dirección configurable (`Bajar de peso` / `Subir de peso`,
`user_weight_settings.goal_direction`): define si "mejor histórico" busca el mínimo o
el máximo registrado, ya que no todos los usuarios buscan bajar de peso. El módulo
también muestra una gráfica de mejor/peor mes por año (`WeightExtremesChart`,
`GET /api/weight/yearly-extremes`) para detectar patrones a lo largo del tiempo —
solo considera meses con dato capturado, así que años incompletos no se distorsionan.
Los inputs de valor/meta guardan con `Enter` (no requieren perder el foco).

## Dark / light theme

- Sigue `prefers-color-scheme` por defecto; toggle manual (ícono sol/luna) persistido en
  `localStorage`. Se aplica vía `data-theme="dark"|"light"` en `<html>`, con un script
  inline (`beforeInteractive`) para evitar flash de tema incorrecto — por eso `<html>`
  tiene `suppressHydrationWarning`.
- Paletas como variables CSS en `src/app/globals.css`
  (`:root[data-theme="dark"|"light"]`).
- En páginas pre-login el toggle vive en `TopNav`; en páginas post-login, en el
  `Sidebar` (desktop) o flotante (mobile, `DashboardShell`) — se desplaza con el scroll,
  no queda fijo en pantalla.
