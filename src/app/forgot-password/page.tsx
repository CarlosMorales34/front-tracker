import Link from 'next/link';
import { TopNav } from '../../shared/components/layout/TopNav';

// Placeholder simple: no es el foco de esta tarea, solo evita un 404 desde
// el link "¿Olvidaste tu contraseña?" del LoginForm.
export default function ForgotPasswordPage() {
  return (
    <>
      <TopNav />
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '3rem 1.25rem', textAlign: 'center' }}>
        <h1>Recuperar contraseña</h1>
        <p>Esta sección estará disponible pronto. Por ahora, contacta al equipo para restablecer tu contraseña.</p>
        <Link href="/login">Volver a iniciar sesión</Link>
      </div>
    </>
  );
}
