import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevation?: 's1' | 's2' | 's3';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevation = 's1',
  ...props
}) => {
  const tier = elevation === 's3' ? 'glass glass--strong' : 'glass';
  const tint = elevation === 's2' ? 'bg-white/[0.02]' : '';

  return (
    <div className={`${tier} ${tint} rounded-[16px] ${className}`} {...props}>
      {children}
    </div>
  );
};
