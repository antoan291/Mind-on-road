import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--primary-accent)',
          color: '#ffffff',
        };
      case 'secondary':
        return {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
        };
      case 'danger':
        return {
          background: 'var(--status-error)',
          color: '#ffffff',
        };
      case 'success':
        return {
          background: 'var(--status-success)',
          color: '#ffffff',
        };
      default:
        return {
          background: 'var(--primary-accent)',
          color: '#ffffff',
        };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl font-medium
        flex items-center justify-center gap-2
        cursor-pointer
        transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:opacity-90 active:scale-95
        ${className}
      `}
      style={getVariantStyles()}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
}

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function IconButton({
  icon,
  onClick,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = '',
  ariaLabel,
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--primary-accent)',
          color: '#ffffff',
        };
      case 'secondary':
        return {
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
        };
      default:
        return {
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
        };
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        ${sizeClasses[size]}
        rounded-lg
        flex items-center justify-center
        cursor-pointer
        transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:opacity-80 active:scale-95
        ${className}
      `}
      style={getVariantStyles()}
    >
      {icon}
    </button>
  );
}
