'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import styles from './auth.module.css';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, id, name, ...rest },
  ref
) {
  const inputId = id ?? name;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input ref={ref} id={inputId} name={name} className={styles.input} {...rest} />
    </div>
  );
});
