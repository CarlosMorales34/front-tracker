const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxea /api/* al backend server-side, para que el browser siempre hable
  // con el mismo origen que sirve la app (front y API en puertos distintos
  // son orígenes distintos). Sin esto, la cookie httpOnly de refresh_token
  // es cross-site: con SameSite=Lax el browser no la manda en fetch/XHR
  // (solo en navegaciones), y SameSite=None;Secure solo funciona sobre
  // http://localhost -- se rompe apenas se prueba desde el celular por IP
  // de LAN (justo el caso real de esta app, sesión de entrenamiento en
  // vivo). Con el proxy, todo es same-origin: SameSite=Lax normal alcanza
  // en cualquier host/puerto, con o sin HTTPS.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_BASE_URL}/api/:path*` }];
  },
};

export default nextConfig;
