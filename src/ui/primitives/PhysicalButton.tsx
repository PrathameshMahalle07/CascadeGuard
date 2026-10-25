import React from 'react';

interface PhysicalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'simulate' | 'recovery' | 'secondary';
  icon?: React.ReactNode;
  shortcut?: string;
  size?: 'md' | 'lg';
}

export const PhysicalButton: React.FC<PhysicalButtonProps> = ({
  variant = 'secondary',
  icon,
  shortcut,
  children,
  size = 'md',
  disabled,
  className = '',
  ...props
}) => {
  if (variant === 'secondary') {
    return (
      <button
        disabled={disabled}
        className={`btn-glass inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-[10px] text-[12px] font-medium text-[#BCC4CF] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {shortcut && (
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-data rounded bg-white/5 border border-white/10 text-white/60">
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }

  const padding = size === 'lg' ? 'px-5 py-3 text-[13.5px]' : 'px-4 py-2.5 text-[12.5px]';
  const isRecovery = variant === 'recovery';

  return (
    <button disabled={disabled} className={`pbtn pbtn--${variant} ${className}`} {...props}>
      <div className={`face ${padding} font-semibold`}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {shortcut && (
          <kbd
            className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-data font-medium rounded"
            style={{
              backgroundColor: isRecovery ? 'rgba(4,34,42,0.14)' : 'rgba(255,255,255,0.1)',
              border: isRecovery ? '1px solid rgba(4,34,42,0.22)' : '1px solid rgba(255,255,255,0.16)',
            }}
          >
            {shortcut}
          </kbd>
        )}
      </div>
    </button>
  );
};
