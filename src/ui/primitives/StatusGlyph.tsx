import React from 'react';
import { ServiceStatus } from '../../domain/types';

interface StatusGlyphProps {
  status: ServiceStatus;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

export const StatusGlyph: React.FC<StatusGlyphProps> = ({
  status,
  size = 14,
  showLabel = false,
  className = '',
}) => {
  let glyph: React.ReactNode = null;
  let labelText = 'HEALTHY';
  let colorClass = 'text-[#3FB68B]';

  switch (status) {
    case 'healthy':
      labelText = 'HEALTHY';
      colorClass = 'text-[#3FB68B]';
      glyph = (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="6" />
        </svg>
      );
      break;

    case 'degraded':
      labelText = 'DEGRADED';
      colorClass = 'text-[#E3A33B]';
      glyph = (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="currentColor"
          className="pulse-warn"
        >
          <path d="M8 2L14 13H2L8 2Z" />
        </svg>
      );
      break;

    case 'critical':
      labelText = 'CRITICAL';
      colorClass = 'text-[#E5584F]';
      glyph = (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="currentColor"
          className="pulse-critical"
        >
          <rect x="2.5" y="2.5" width="11" height="11" rx="3" />
        </svg>
      );
      break;

    case 'at-risk':
      labelText = 'AT RISK';
      colorClass = 'text-[#E3A33B]';
      glyph = (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <circle
            cx="8"
            cy="8"
            r="5.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="3 2"
          />
        </svg>
      );
      break;

    case 'recovering':
      labelText = 'RECOVERING';
      colorClass = 'text-[#3FB68B]';
      glyph = (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 2 A6 6 0 0 1 8 14 Z" fill="currentColor" />
        </svg>
      );
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${colorClass} ${className}`} title={labelText}>
      <span className="flex-shrink-0 flex items-center justify-center">{glyph}</span>
      {showLabel && (
        <span className="text-[11px] font-mono-tech tracking-wider uppercase font-medium">
          {labelText}
        </span>
      )}
    </span>
  );
};
