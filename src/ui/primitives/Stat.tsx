import React from 'react';
import { Card } from './Card';

interface StatProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'good' | 'warn' | 'crit' | 'neutral';
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  subValue,
  trend = 'neutral',
  badge,
  icon,
}) => {
  let valueColor = 'text-[#F5F7FA]';
  let iconTone = 'text-[#67E8F9] bg-[#67E8F9]/10 border-[#67E8F9]/25';
  if (trend === 'good') { valueColor = 'text-[#4FD8A4]'; iconTone = 'text-[#4FD8A4] bg-[#3FB68B]/10 border-[#3FB68B]/30'; }
  if (trend === 'warn') { valueColor = 'text-[#F2B550]'; iconTone = 'text-[#F2B550] bg-[#E3A33B]/10 border-[#E3A33B]/30'; }
  if (trend === 'crit') { valueColor = 'text-[#FF6B5F]'; iconTone = 'text-[#FF6B5F] bg-[#E5584F]/10 border-[#E5584F]/30'; }

  return (
    <Card className="p-4 flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[12px] font-medium text-[#8E99A8] truncate">{label}</span>
        {icon && (
          <span className={`w-6 h-6 rounded-[8px] border flex items-center justify-center flex-shrink-0 ${iconTone}`}>
            {icon}
          </span>
        )}
        {badge}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2 min-w-0">
        <div className={`font-display value-glow text-[26px] sm:text-[30px] lg:text-[34px] font-[400] tracking-[-0.03em] tabular-nums leading-none ${valueColor}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-[10.5px] sm:text-[11px] text-[#8E99A8] truncate max-w-full">{subValue}</div>
        )}
      </div>
    </Card>
  );
};
