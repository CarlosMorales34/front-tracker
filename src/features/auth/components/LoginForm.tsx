'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AppleIcon, CompassIcon, GoogleIcon } from '../../../shared/components/icons/icons';
import { useAuth } from '../context/AuthContext';
import { AuthButton } from './AuthButton';
import { AuthInput } from './AuthInput';
import styles from './auth.module.css';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      // 401 = credenciales inválidas (mensaje genérico del backend);
      // 400 = validación, ambos ya vienen como body.message desde apiFetch.
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // No hay OAuth configurado todavía: en vez de fingir un login o dejar el
  // botón roto, mostramos un aviso y no navegamos a ningún lado.
  const handleOauthClick = (provider: string) => {
    setOauthNotice(`Continuar con ${provider} estará disponible próximamente.`);
  };

  return (
    <div className={styles.authScreen}>
      <div className={styles.iconBox}>
        <CompassIcon />
      </div>
      <h1 className={styles.title}>Bienestar Integral</h1>
      <p className={styles.subtitle}>
        Mide y mejora tu productividad, tus finanzas y tu cuerpo — sin motivación barata, con
        seguimiento real.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Correo electrónico"
          type="email"
          name="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <AuthInput
          label="Contraseña"
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className={styles.errorText}>{error}</p>}

        <AuthButton type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </AuthButton>
      </form>

      <div className={styles.separator}>
        <span>o continúa con</span>
      </div>

      <div className={styles.oauthGroup}>
        <AuthButton type="button" variant="outline" onClick={() => handleOauthClick('Google')}>
          <GoogleIcon /> Continuar con Google
        </AuthButton>
        <AuthButton type="button" variant="outline" onClick={() => handleOauthClick('Apple')}>
          <AppleIcon /> Continuar con Apple
        </AuthButton>
      </div>
      {oauthNotice && <p className={styles.oauthNotice}>{oauthNotice}</p>}

      <Link href="/forgot-password" className={styles.forgotLink}>
        ¿Olvidaste tu contraseña?
      </Link>

      <p className={styles.footerText}>
        ¿Nuevo aquí?{' '}
        <Link href="/register" className={styles.footerLink}>
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
