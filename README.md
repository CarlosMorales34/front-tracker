# eduplatform — vitalis Web

Frontend de **vitalis**, app personal de auto-seguimiento (peso, hábitos, métricas custom).
Next.js (App Router) + TypeScript + React.

La UI de login/registro usa "Bienestar Integral" como copy de producto (mockup del
usuario) — no es un rename del proyecto ni del paquete, sigue siendo `eduplatform`/`vitalis`.

## Estructura

```
src/
  app/                      # Rutas (App Router)
    layout.tsx              # ThemeProvider + AuthProvider + script anti-flash de tema
    page.tsx                # Home (TopNav + AppShell)
    login/page.tsx           # LoginForm
    register/page.tsx        # RegisterForm
    forgot-password/page.tsx # Placeholder simple
    metrics/page.tsx         # Protegida: redirige a /login si no hay sesión
  features/
    auth/
      components/           # LoginForm, RegisterForm, AuthInput/AuthButton (átomos compartidos)
      context/               # AuthContext (user, accessToken en memoria, login/register/logout)
      services/               # auth.api.ts (credentials:'include' para la cookie de refresh)
      types/                 # User, LoginInput, RegisterInput, AuthResponse
    metrics/
      components/         # UI de la feature
      services/           # Cliente HTTP hacia la API (samarya), manda Authorization: Bearer
      types/              # Tipos del dominio en el front
  shared/
    lib/                  # api-client.ts (fetch genérico + manejo de 204 sin body)
    theme/                # ThemeProvider (dark/light) + ThemeToggle
    components/
      layout/              # AppShell, TopNav (nav pills Home/Login + toggle de tema)
      icons/                # Íconos inline SVG genéricos (placeholder, sin logos de marca)
```

## Levantar en local

Requiere la API (`samarya`) corriendo en `http://localhost:4000` para que auth y metrics
funcionen contra datos reales. Sin la API corriendo, las pantallas igual renderizan
(login/register muestran error de red al intentar loguear; `/metrics` redirige a `/login`
porque el refresh silencioso de sesión falla).

```bash
cp .env.example .env
npm install
npm run dev   # http://localhost:3000
```

## Auth (UI)

Contrato consumido (definido por el backend, no se modifica desde el front):

```
POST /api/auth/register  -> 201 { user, accessToken } + cookie httpOnly refresh_token
POST /api/auth/login     -> 200 { user, accessToken } + cookie httpOnly refresh_token
POST /api/auth/refresh   -> 200 { accessToken }        (usa la cookie)
POST /api/auth/logout    -> 204
```

- El `accessToken` vive solo en memoria (estado de React en `AuthContext`), nunca en
  `localStorage` — el refresh token vive en la cookie httpOnly.
- Al montar la app, `AuthContext` intenta `POST /api/auth/refresh` para recuperar sesión
  silenciosamente. Ese endpoint no devuelve `user`, así que el usuario se deriva
  decodificando el payload del `accessToken` (JWT) de forma best-effort; si eso falla,
  la sesión no se recupera. Ver el comentario en `src/features/auth/context/AuthContext.tsx`.
- `/metrics` es la única ruta protegida por ahora: si `user` es `null` después de que
  `isLoading` termina, redirige a `/login`.
- Los botones "Continuar con Google/Apple" no tienen OAuth configurado todavía: al
  hacer click muestran un aviso "estará disponible próximamente" sin navegar ni fingir
  autenticación.

## Dark / light theme

- El tema por defecto sigue `prefers-color-scheme` del sistema. Hay un botón toggle
  (ícono sol/luna) en `TopNav`, visible en `/`, `/login`, `/register` y `/forgot-password`,
  que permite forzar un tema manualmente; la elección se persiste en `localStorage`
  (`key: "theme"`).
- El tema se aplica seteando `data-theme="dark"|"light"` en `<html>`. Un script inline
  (`next/script` con `strategy="beforeInteractive"`, en `src/app/layout.tsx`) lee
  `localStorage` antes de la hidratación para evitar el flash de tema incorrecto. Por
  eso `<html>` tiene `suppressHydrationWarning` — es esperado que el atributo
  `data-theme` no esté presente en el HTML generado por el servidor.
- Las paletas están definidas como variables CSS en `src/app/globals.css`, bajo
  `:root[data-theme="dark"]` / `:root[data-theme="light"]`, con un fallback vía
  `@media (prefers-color-scheme: dark)` para el caso sin JS / antes de hidratar.

**Cómo probar ambos temas:**
1. Abrir `/login` (o cualquier página con `TopNav`).
2. Click en el ícono sol/luna arriba a la derecha — alterna el tema y persiste.
3. Recargar la página: el tema elegido se mantiene (localStorage) y no debería verse
   un flash del tema contrario al cargar.
4. Sin tocar el toggle: cambiar la preferencia de color del sistema operativo/navegador
   y recargar en una pestaña/perfil sin `localStorage` previo — debería seguir la
   preferencia del sistema.
