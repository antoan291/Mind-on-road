interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: ButtonProps) {
  const sizeClasses = {
    small: 'h-9 px-4 text-sm',
    medium: 'h-11 px-6 text-base',
    large: 'h-12 px-8 text-base',
  }[size];

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
      color: '#ffffff',
      hover: 'shadow-[var(--glow-indigo)]',
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--ghost-border-medium)',
      hover: 'shadow-[var(--glow-indigo)]',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      hover: 'shadow-[var(--glow-indigo)]',
    },
    destructive: {
      background: 'var(--status-error)',
      color: '#ffffff',
      hover: 'opacity-90',
    },
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses}
        rounded-lg font-medium
        inline-flex items-center justify-center gap-2
        cursor-pointer
        transition-all duration-200
        hover:shadow-[var(--glow-indigo)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        background: variantStyles.background,
        color: variantStyles.color,
        border: variantStyles.border,
      }}
    >
      {icon}
      {children}
    </button>
  );
}
