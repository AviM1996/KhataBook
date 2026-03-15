import React from 'react';
import styles from './Button.module.css';
import { LoaderInline } from '../../index';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon,
  ...props
}) => {
  const buttonClasses = [
    styles.btn,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className
  ].join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <LoaderInline size="small" color={variant === 'primary' ? 'black' : 'white'} />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
