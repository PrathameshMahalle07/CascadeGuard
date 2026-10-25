import React, { useState } from 'react';
import { AnalysisResult, GeminiIncidentCommanderOutput, SimPhase } from '../../domain/types';
import { Card } from '../primitives/Card';
import {
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';

interface AiIncidentReasoningProps {
  analysis: AnalysisResult | null;
  phase: SimPhase;
  commanderReasoning: GeminiIncidentCommanderOutput | null;
  isLoadingAi?: boolean;
}

export const AiIncidentReasoning: React.FC<AiIncidentReasoningProps> = ({
  analysis,
  phase,
  commanderReasoning,
  isLoadingAi = false,
}) => {
  const [expandedSection, setExpandedSection] = useState<'all' | 'root' | 'cascade' | 'action' | 'risk'>('all');

  const toggleSection = (section: 'root' | 'cascade' | 'action' | 'risk') => {
    setExpandedSection(expandedSection === section ? 'all' : section);
  };

  const isHealthy = phase === 'healthy';

  if (isHealthy || !analysis) {
    return (
      <Card className="p-5 bg-white/[0.035] border-white/8 flex flex-col justify-center items-center text-center h-full min-h-[360px]">
        <div className="w-12 h-12 rounded-full bg-white/4 border border-white/8 flex items-center justify-center mb-3">
          <BrainCircuit size={22} className="text-[#3FB68B]" />
        </div>
        <h4 className="text-[14px] font-medium text-[#F5F7FA]">AI Incident Commander Idle</h4>
        <p className="text-[12px] text-[#8E99A8] max-w-xs mt-1 leading-relaxed">
          Reasoning engine standing by. Upon anomaly detection, Gemini analyzes deterministic cascade traces to isolate root causes and formulate mitigation.
        </p>
        <span className="mt-4 px-2.5 py-1 rounded bg-white/4 border border-white/6 text-[10.5px] font-mono-tech text-[#BCC4CF]">
          RUN INCIDENT TO ACTIVATE REASONING
        </span>
      </Card>
    );
  }

  const reasoning = commanderReasoning;
  const rootLabel = analysis.rootCause.label;
  const confidence = analysis.rootCause.confidence;
  const nextTarget = analysis.predictedFailures[0];
  const etaText = nextTarget ? `~${nextTarget.etaMin}m 00s` : '~4m 18s';
  const recStrategy = analysis.strategies.find((s) => s.id === analysis.recommendedStrategyId) || analysis.strategies[0];

  return (
    <Card className="flex flex-col bg-white/[0.035] border-white/8 overflow-hidden">
      {/* Header with Provenance Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 border-b border-white/6 bg-white/[0.04]">
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-[#67E8F9]" />
          <h3 className="text-[13px] font-semibold text-[#F5F7FA] tracking-tight uppercase">
            AI Incident Reasoning
          </h3>
        </div>

        {/* Provenance Indicators */}
        <div className="flex items-center gap-1.5 font-mono-tech text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[#3FB68B]/10 border border-[#3FB68B]/20 text-[#3FB68B] font-bold">
            ENGINE VERIFIED
          </span>
          <span className="px-2 py-0.5 rounded bg-[#67E8F9]/10 border border-[#67E8F9]/20 text-[#67E8F9] font-bold flex items-center gap-1">
            <Sparkles size={10} />
            {reasoning?.provenance.includes('GEMINI REASONING') ? 'GEMINI REASONING' : 'SYNTHESIS'}
          </span>
        </div>
      </div>

      {/* Main Reasoning Body with Progressive Disclosure */}
      <div className="p-3 sm:p-3.5 space-y-3 font-sans min-w-0">
        {/* Top Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* 1. Root Cause */}
          <div className="p-2 sm:p-2.5 rounded-[6px] bg-black/35 border border-white/6 min-w-0">
            <span className="text-[10px] font-mono-tech uppercase text-[#8E99A8] block">Root Cause</span>
            <span className="text-[11.5px] sm:text-[12px] font-semibold text-[#F5F7FA] truncate block mt-0.5" title={rootLabel}>
              {rootLabel}
            </span>
          </div>

          {/* 2. Confidence */}
          <div className="p-2 sm:p-2.5 rounded-[6px] bg-black/35 border border-white/6 min-w-0">
            <span className="text-[10px] font-mono-tech uppercase text-[#8E99A8] block">Confidence</span>
            <span className="text-[12.5px] sm:text-[13px] font-mono-tech font-bold text-[#67E8F9] block mt-0.5">
              {confidence}%
            </span>
          </div>

          {/* 3. Time to Critical */}
          <div className="p-2 sm:p-2.5 rounded-[6px] bg-black/35 border border-white/6 min-w-0">
            <span className="text-[10px] font-mono-tech uppercase text-[#8E99A8] block">Time to Critical</span>
            <span className="text-[12.5px] sm:text-[13px] font-mono-tech font-bold text-[#E5584F] block mt-0.5">
              {etaText}
            </span>
          </div>

          {/* 4. Blast Radius */}
          <div className="p-2 sm:p-2.5 rounded-[6px] bg-black/35 border border-white/6 min-w-0">
            <span className="text-[10px] font-mono-tech uppercase text-[#8E99A8] block">At-Risk Nodes</span>
            <span className="text-[12.5px] sm:text-[13px] font-mono-tech font-bold text-[#E3A33B] block mt-0.5">
              {analysis.predictedFailures.length + 1} Services
            </span>
          </div>
        </div>

        {/* Section 1: Deep Root Cause & Evidence */}
        <div className="rounded-[8px] bg-white/[0.05] border border-white/6 overflow-hidden min-w-0">
          <button
            type="button"
            onClick={() => toggleSection('root')}
            className="w-full flex items-center justify-between p-2.5 text-left hover:bg-white/3 transition-colors min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <AlertTriangle size={13} className="text-[#E5584F] flex-shrink-0" />
              <span className="text-[11.5px] sm:text-[12px] font-semibold text-[#F5F7FA] truncate">Root-Cause Analysis & Evidence</span>
            </div>
            {expandedSection === 'root' ? <ChevronUp size={14} className="text-[#8E99A8] flex-shrink-0 ml-1" /> : <ChevronDown size={14} className="text-[#8E99A8] flex-shrink-0 ml-1" />}
          </button>

          {(expandedSection === 'all' || expandedSection === 'root') && (
            <div className="p-3 pt-0 border-t border-white/4 space-y-2 text-[12px] min-w-0">
              <p className="text-[#D0D6E0] leading-snug break-words">
                {reasoning?.rootCauseSummary || `${rootLabel} detected. Telemetry thresholds exceeded on primary database pool.`}
              </p>
              <div className="space-y-1.5 pt-1">
                {(reasoning?.detailedEvidence || analysis.rootCause.evidence).map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-2 font-mono-tech text-[10.5px] sm:text-[11px] text-[#BCC4CF] min-w-0">
                    <span className="text-[#67E8F9] mt-0.5 flex-shrink-0">•</span>
                    <span className="break-words min-w-0 flex-1">{ev}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Cascade Mechanism & Blast Radius */}
        <div className="rounded-[8px] bg-white/[0.05] border border-white/6 overflow-hidden min-w-0">
          <button
            type="button"
            onClick={() => toggleSection('cascade')}
            className="w-full flex items-center justify-between p-2.5 text-left hover:bg-white/3 transition-colors min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Flame size={13} className="text-[#E3A33B] flex-shrink-0" />
              <span className="text-[11.5px] sm:text-[12px] font-semibold text-[#F5F7FA] truncate">Cascade Propagation Mechanism</span>
            </div>
            {expandedSection === 'cascade' ? <ChevronUp size={14} className="text-[#8E99A8] flex-shrink-0 ml-1" /> : <ChevronDown size={14} className="text-[#8E99A8] flex-shrink-0 ml-1" />}
          </button>

          {(expandedSection === 'all' || expandedSection === 'cascade') && (
            <div className="p-3 pt-0 border-t border-white/4 space-y-2 text-[12px] min-w-0">
              <p className="text-[#D0D6E0] leading-snug break-words">
                {reasoning?.cascadeMechanism || 'Synchronous database latency locks payment worker threads, cascading upward into ingress gateway reverse proxies.'}
              </p>
              <p className="text-[11.5px] text-[#BCC4CF] break-words">
                <strong className="text-[#F5F7FA]">Downstream Impact: </strong>
                {reasoning?.blastRadiusExplanation || 'Payment checkout failures will escalate to full frontend HTTP 504 timeouts.'}
              </p>
            </div>
          )}
        </div>

        {/* Section 3: Recommended Action & Justification */}
        <div className="rounded-[8px] bg-white/[0.05] border border-[#67E8F9]/30 overflow-hidden min-w-0">
          <button
            type="button"
            onClick={() => toggleSection('action')}
            className="w-full flex items-center justify-between p-2.5 text-left hover:bg-white/3 transition-colors min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <ShieldCheck size={13} className="text-[#67E8F9] flex-shrink-0" />
              <span className="text-[11.5px] sm:text-[12px] font-semibold text-[#67E8F9] truncate">
                Recommended Action: {recStrategy.name}
              </span>
            </div>
            {expandedSection === 'action' ? <ChevronUp size={14} className="text-[#8E99A8] flex-shrink-0 ml-1" /> : <ChevronDown size={14} className="text-[#8E99A8] flex-shrink-0 ml-1" />}
          </button>

          {(expandedSection === 'all' || expandedSection === 'action') && (
            <div className="p-3 pt-0 border-t border-white/4 space-y-2 text-[12px] min-w-0">
              <p className="text-[#F5F7FA] font-medium leading-snug break-words">
                {reasoning?.recommendedAction || recStrategy.name} (Estimated Recovery: {recStrategy.recoverySec}s)
              </p>
              <p className="text-[11.5px] text-[#BCC4CF] break-words">
                <strong className="text-[#67E8F9]">Why This Action: </strong>
                {reasoning?.whyThisAction || 'Lowest expected blast radius with fastest recovery time, avoiding cold-start database stampedes.'}
              </p>
            </div>
          )}
        </div>

        {/* Section 4: Risk If Ignored */}
        <div className="p-2.5 rounded-[8px] bg-[#E5584F]/10 border border-[#E5584F]/25 flex items-start gap-2.5 text-[11.5px] min-w-0">
          <ShieldAlert size={15} className="text-[#E5584F] flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-mono-tech text-[10px] uppercase font-bold text-[#E5584F] block">
              Risk If Ignored
            </span>
            <p className="text-[#F5F7FA] mt-0.5 break-words">
              {reasoning?.riskIfIgnored || 'Complete platform checkout outage within estimated 4-minute window as ingress threadpools saturate.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
