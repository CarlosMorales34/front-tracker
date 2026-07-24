'use client';

import { ButtonHTMLAttributes } from 'react';
import styles from './auth.module.css';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export function AuthButton({ variant = 'primary', className, ...rest }: AuthButtonProps) {
  const variantClass = variant === 'primary' ? styles.primaryButton : styles.outlineButton;
  return <button className={[variantClass, className].filter(Boolean).join(' ')} {...rest} />;
}
