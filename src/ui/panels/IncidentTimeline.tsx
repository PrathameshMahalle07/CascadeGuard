import React from 'react';
import { TimelineEntry } from '../../domain/types';
import { Card } from '../primitives/Card';
import { GitCommit, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface IncidentTimelineProps {
  timeline: TimelineEntry[];
  phase: string;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ timeline, phase }) => {
  return (
    <Card className="flex flex-col h-[340px] bg-white/[0.035] border-white/8 p-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/6">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#67E8F9]" />
          <h3 className="text-[12px] font-semibold text-[#F5F7FA] tracking-tight">
            Incident Causality Timeline
          </h3>
        </div>
        <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[#8E99A8]">
          SIM CLOCK
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pt-1 space-y-3">
        {timeline.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#7F8A99] text-[11px] font-mono-tech text-center p-4">
            <span className="mb-1">No active incident trajectory.</span>
            <span className="text-[10px]">Timeline records trigger automatically on simulation.</span>
          </div>
        ) : (
          timeline.map((entry, idx) => {
            const isLatest = idx === timeline.length - 1;
            const isResolved = entry.phase === 'resolved';

            let dotColor = 'bg-[#7C8591]';
            if (entry.highlight) dotColor = 'bg-[#67E8F9]';
            if (isResolved) dotColor = 'bg-[#3FB68B]';
            if (entry.phase === 'injecting' || entry.phase === 'analyzing') dotColor = 'bg-[#E3A33B]';

            return (
              <div key={entry.id || idx} className="flex items-start gap-2.5 relative group">
                {/* Connecting line */}
                {idx !== timeline.length - 1 && (
                  <div className="absolute left-[7px] top-[14px] bottom-[-16px] w-[1px] bg-white/10" />
                )}

                {/* Node marker */}
                <div
                  className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center border border-black/50 mt-0.5 ${dotColor} ${
                    isLatest && phase !== 'resolved' ? 'animate-pulse ring-2 ring-white/15' : ''
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-black/35" />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono-tech font-semibold text-[#F5F7FA]">
                      {entry.time}
                    </span>
                    <span className="text-[9.5px] font-mono-tech px-1.5 py-0.2 rounded bg-white/5 text-[#8E99A8] uppercase">
                      {entry.phase}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#BCC4CF] leading-snug mt-0.5">
                    {entry.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
