import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../../domain/types';
import { Card } from '../primitives/Card';
import { Terminal, Play, Pause, Trash2, ArrowDownCircle, Filter } from 'lucide-react';

interface LiveLogsProps {
  logs: LogEntry[];
  isPaused: boolean;
  onTogglePause: () => void;
  onClear: () => void;
}

export const LiveLogs: React.FC<LiveLogsProps> = ({
  logs,
  isPaused,
  onTogglePause,
  onClear,
}) => {
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((l) => {
    if (filterLevel === 'ALL') return true;
    return l.level === filterLevel;
  });

  const handleScroll = () => {
    if (!logContainerRef.current) return;
    const { scrollTop } = logContainerRef.current;
    // Since logs are prepended, top is latest
    setIsScrolledUp(scrollTop > 40);
  };

  const scrollToLatest = () => {
    if (!logContainerRef.current) return;
    logContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    setIsScrolledUp(false);
  };

  return (
    <Card className="flex flex-col h-[340px] bg-black/25 border-white/8 relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 border-b border-white/6 bg-white/[0.04] min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal size={14} className="text-[#67E8F9] flex-shrink-0" />
          <h3 className="text-[12px] font-semibold text-[#F5F7FA] tracking-tight truncate">
            Live Telemetry Stream
          </h3>
          <span className="text-[9.5px] sm:text-[10px] font-data px-1.5 py-0.2 rounded bg-white/5 border border-white/8 text-[#8E99A8] flex-shrink-0">
            {logs.length} lines
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Level Filter */}
          <div className="flex items-center bg-black/35 rounded-[6px] border border-white/8 p-0.5 text-[9.5px] sm:text-[10px] font-data">
            {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-1 sm:px-1.5 py-0.5 rounded-[4px] uppercase ${
                  filterLevel === lvl
                    ? 'bg-white/15 text-[#F5F7FA] font-bold'
                    : 'text-[#8E99A8] hover:text-[#BCC4CF]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className={`p-1.5 rounded-[6px] border text-[11px] font-data flex items-center gap-1 ${
              isPaused
                ? 'bg-[#E3A33B]/20 text-[#E3A33B] border-[#E3A33B]/40'
                : 'bg-white/5 text-[#BCC4CF] border-white/10 hover:text-white'
            }`}
            title={isPaused ? 'Resume log stream' : 'Pause log stream'}
          >
            {isPaused ? <Play size={11} /> : <Pause size={11} />}
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            className="p-1.5 rounded-[6px] border border-white/10 bg-white/5 text-[#BCC4CF] hover:text-[#E5584F] hover:border-[#E5584F]/40"
            title="Clear logs"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div
        ref={logContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2.5 sm:p-3 font-data text-[11px] space-y-1.5 custom-scrollbar"
        role="log"
        aria-live="off"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#7F8A99] text-[11px]">
            No telemetry records matching filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            let levelBadge = 'text-[#3FB68B] bg-[#3FB68B]/10 border-[#3FB68B]/20';
            if (log.level === 'WARN') {
              levelBadge = 'text-[#E3A33B] bg-[#E3A33B]/10 border-[#E3A33B]/20';
            } else if (log.level === 'ERROR') {
              levelBadge = 'text-[#E5584F] bg-[#E5584F]/10 border-[#E5584F]/20';
            }

            return (
              <div
                key={log.id}
                className="flex items-start gap-1.5 sm:gap-2 py-0.5 hover:bg-white/3 rounded px-1 transition-colors leading-relaxed min-w-0"
              >
                <span className="text-[#7F8A99] flex-shrink-0 select-none text-[10px] sm:text-[11px]">
                  {log.timestamp}
                </span>

                <span
                  className={`px-1 sm:px-1.5 py-0.2 rounded text-[9px] sm:text-[9.5px] border uppercase font-bold flex-shrink-0 ${levelBadge}`}
                >
                  {log.level}
                </span>

                <span className="text-[#67E8F9] flex-shrink-0 font-medium text-[10px] sm:text-[11px]">
                  [{log.service}]
                </span>

                <span className="text-[#D0D6E0] flex-1 break-words min-w-0 text-[10.5px] sm:text-[11px]">
                  {log.message}
                </span>

                <span className="text-[#525B66] text-[10px] flex-shrink-0 hidden sm:inline select-none">
                  {log.requestId}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Jump to latest chip when scrolled */}
      {isScrolledUp && (
        <button
          onClick={scrollToLatest}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.09] border border-[#67E8F9]/40 text-[#67E8F9] text-[11px] font-data shadow-lg hover:bg-white/[0.12] transition-colors"
        >
          <ArrowDownCircle size={12} />
          <span>Jump to latest</span>
        </button>
      )}
    </Card>
  );
};
