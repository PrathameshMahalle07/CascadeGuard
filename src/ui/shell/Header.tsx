import React from 'react';
import { Menu, Activity, ShieldCheck, Clock, RefreshCw, Command } from 'lucide-react';
import { SimPhase } from '../../domain/types';

interface HeaderProps {
  phase: SimPhase;
  simClock: string;
  onOpenMobileSidebar: () => void;
  onReset: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  phase,
  simClock,
  onOpenMobileSidebar,
  onReset,
  onOpenCommandPalette,
}) => {
  return (
    <header className="h-[52px] border-b border-white/6 bg-[#06080B]/40 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.05),0_10px_30px_-14px_rgba(0,0,0,0.7)] sticky top-0 z-30 flex items-center justify-between px-2.5 sm:px-4 lg:px-6">
      {/* Left side: Mobile menu toggle + Environment Chip */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden text-[#BCC4CF] hover:text-[#F5F7FA] p-1.5 rounded-[6px] border border-white/8 bg-white/4 flex-shrink-0"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          {/* Environment Chip */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-[6px] bg-white/[0.05] border border-white/6 text-[10.5px] sm:text-[11px] font-mono-tech flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#67E8F9] flex-shrink-0" />
            <span className="text-[#BCC4CF]">ENV:</span>
            <span className="text-[#F5F7FA] font-medium">
              <span className="hidden sm:inline">Production </span>Sim
            </span>
          </div>

          {/* System Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/[0.05] border border-white/6 text-[11px] font-mono-tech">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                phase === 'healthy' || phase === 'resolved'
                  ? 'bg-[#3FB68B]'
                  : 'bg-[#E5584F] animate-ping'
              }`}
            />
            <span className="text-[#8E99A8]">STATUS:</span>
            <span
              className={`font-semibold ${
                phase === 'healthy' || phase === 'resolved'
                  ? 'text-[#3FB68B]'
                  : 'text-[#E5584F]'
              }`}
            >
              {phase === 'healthy'
                ? 'Monitoring Active'
                : phase === 'resolved'
                ? 'Resolved'
                : 'Incident In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Last Analysis, Sim Clock & SIM tag */}
      <div className="flex items-center gap-1.5 sm:gap-3 text-[10.5px] sm:text-[11px] font-mono-tech flex-shrink-0">
        {/* Reset Quick Action if in incident */}
        {phase !== 'healthy' && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-[6px] bg-white/5 border border-white/10 text-[#BCC4CF] hover:text-[#F5F7FA] hover:bg-white/8 transition-colors flex-shrink-0"
            title="Reset system to healthy baseline"
          >
            <RefreshCw size={11} className="flex-shrink-0" />
            <span className="hidden sm:inline">Reset Baseline</span>
            <span className="sm:hidden">Reset</span>
          </button>
        )}

        {/* Last Analysis */}
        <div className="hidden md:flex items-center gap-1.5 text-[#8E99A8]">
          <Clock size={12} className="text-[#7F8A99]" />
          <span>Last analysis:</span>
          <span className="text-[#BCC4CF] font-medium">Just now</span>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/5 border border-white/10 text-[#BCC4CF] hover:text-[#F5F7FA] hover:bg-white/8 transition-colors cursor-pointer"
          title="Open Command Palette (Ctrl+K or ?)"
        >
          <Command size={12} className="text-[#67E8F9]" />
          <span className="text-[10.5px]">Commands</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/35 border border-white/15 text-[#67E8F9] text-[9.5px] font-bold">
            Ctrl+K
          </kbd>
        </button>

        {/* Sim Clock */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-[6px] bg-white/[0.035] border border-white/8 text-[#F5F7FA]">
          <span className="text-[#8E99A8]">SIM:</span>
          <span className="font-semibold text-[#67E8F9] tabular-nums">{simClock}</span>
        </div>

        {/* Persistent SIM chip on desktop */}
        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#67E8F9]/10 border border-[#67E8F9]/20 text-[#67E8F9] font-bold text-[9.5px]">
          SIM
        </span>
      </div>
    </header>
  );
};
