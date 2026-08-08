'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../../../shared/components/icons/icons';
import styles from './auth.module.css';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, id, name, type, ...rest },
  ref
) {
  const inputId = id ?? name;
  const isPassword = type === 'password';
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      {isPassword ? (
        <div className={styles.passwordFieldWrap}>
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={isRevealed ? 'text' : 'password'}
            className={styles.input}
            {...rest}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setIsRevealed((prev) => !prev)}
            aria-label={isRevealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            <span key={isRevealed ? 'revealed' : 'hidden'} className={styles.iconCrossfade}>
              {isRevealed ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
            </span>
          </button>
        </div>
      ) : (
        <input ref={ref} id={inputId} name={name} type={type} className={styles.input} {...rest} />
      )}
    </div>
  );
});
