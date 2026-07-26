'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AppleIcon, CompassIcon } from '../../../shared/components/icons/icons';
import { useAuth } from '../context/AuthContext';
import { AuthButton } from './AuthButton';
import { AuthInput } from './AuthInput';
import { GoogleSignInButton } from './GoogleSignInButton';
import styles from './auth.module.css';

export function RegisterForm() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
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
      await register({ name, email, password });
      router.push('/dashboard');
    } catch (err) {
      // 409 = email ya existe, 400 = validación; ambos llegan como
      // body.message desde apiFetch y se muestran tal cual bajo el form.
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOauthClick = (provider: string) => {
    setOauthNotice(`Continuar con ${provider} estará disponible próximamente.`);
  };

  const handleGoogleCredential = async (idToken: string) => {
    setError(null);
    try {
      await loginWithGoogle(idToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta con Google.');
    }
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
          label="Nombre"
          type="text"
          name="name"
          placeholder="Tu nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
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
          autoComplete="new-password"
          required
        />

        {error && <p className={styles.errorText}>{error}</p>}

        <AuthButton type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </AuthButton>
      </form>

      <div className={styles.separator}>
        <span>o continúa con</span>
      </div>

      <div className={styles.oauthGroup}>
        <GoogleSignInButton onCredential={handleGoogleCredential} onError={setError} />
        <AuthButton type="button" variant="outline" onClick={() => handleOauthClick('Apple')}>
          <AppleIcon /> Continuar con Apple
        </AuthButton>
      </div>
      {oauthNotice && <p className={styles.oauthNotice}>{oauthNotice}</p>}

      <p className={styles.footerText}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className={styles.footerLink}>
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
