import React from 'react';
import { AnalysisResult, SimPhase } from '../../domain/types';
import { Card } from '../primitives/Card';
import { StatusGlyph } from '../primitives/StatusGlyph';
import { SERVICES } from '../../domain/services';
import {
  ShieldAlert,
  BrainCircuit,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  Terminal,
} from 'lucide-react';

interface AiIncidentAnalysisProps {
  analysis: AnalysisResult | null;
  phase: SimPhase;
  analyzingStep: number;
  recoveryStep: number;
  recoveryStepText: string;
  resolvedSummary: string | null;
}

const ANALYZING_STEPS = [
  'Correlating incoming log stream & anomaly vectors',
  'Tracing backward dependency graph propagation',
  'Scoring system cascade risk & downstream ETAs',
  'Ranking mitigation strategies by recovery & risk',
];

export const AiIncidentAnalysis: React.FC<AiIncidentAnalysisProps> = ({
  analysis,
  phase,
  analyzingStep,
  recoveryStep,
  recoveryStepText,
  resolvedSummary,
}) => {
  return (
    <Card className="flex flex-col h-full bg-white/[0.035] border-white/8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/6">
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-[#67E8F9]" />
          <h3 className="text-[14px] font-semibold text-[#F5F7FA] tracking-tight">
            AI Incident Analysis
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[#8E99A8]">
            {phase === 'healthy' ? 'MONITORING' : phase.toUpperCase()}
          </span>
        </div>
      </div>

      {/* IDLE STATE */}
      {phase === 'healthy' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#8E99A8]">
          <div className="w-12 h-12 rounded-full bg-white/3 border border-white/6 flex items-center justify-center mb-3">
            <CheckCircle size={20} className="text-[#3FB68B]" />
          </div>
          <h4 className="text-[13px] font-medium text-[#F5F7FA] mb-1">Telemetry Baseline Nominal</h4>
          <p className="text-[12px] max-w-xs text-[#8E99A8] leading-relaxed">
            AI failure prediction engine observing 8 microservices. No anomalous latency cascade or saturation detected.
          </p>
          <div className="mt-4 px-3 py-1.5 rounded-[6px] bg-white/[0.05] border border-white/6 text-[11px] font-mono-tech text-[#BCC4CF]">
            Trigger <span className="text-[#67E8F9] font-semibold">Simulate Failure</span> to initiate cascade analysis
          </div>
        </div>
      )}

      {/* ANALYZING STATE */}
      {(phase === 'injecting' || phase === 'analyzing') && (
        <div className="flex-1 flex flex-col justify-center space-y-3.5 p-2">
          <div className="flex items-center gap-2 text-[#67E8F9] text-[12px] font-mono-tech font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#67E8F9] animate-ping" />
            Analyzing telemetry anomalies...
          </div>

          <div className="space-y-2">
            {ANALYZING_STEPS.map((step, idx) => {
              const stepIndex = idx + 1;
              const isDone = analyzingStep > stepIndex;
              const isCurrent = analyzingStep === stepIndex;

              return (
                <div
                  key={step}
                  className={`p-2.5 rounded-[6px] border text-[11px] font-mono-tech flex items-center justify-between transition-all duration-150 ${
                    isDone
                      ? 'bg-white/[0.05] border-white/8 text-[#3FB68B]'
                      : isCurrent
                      ? 'bg-white/[0.09] border-[#67E8F9]/40 text-[#F5F7FA]'
                      : 'bg-white/[0.035] border-white/5 text-[#7F8A99]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white/5 border border-white/10">
                      {isDone ? '✓' : stepIndex}
                    </span>
                    <span>{step}</span>
                  </div>
                  {isCurrent && <span className="text-[#67E8F9] animate-pulse">Running</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECOVERING STATE */}
      {phase === 'recovering' && (
        <div className="flex-1 flex flex-col justify-center p-3 space-y-3">
          <div className="flex items-center gap-2 text-[#3FB68B] text-[12px] font-mono-tech font-semibold uppercase">
            <span className="w-2 h-2 rounded-full bg-[#3FB68B] animate-ping" />
            Remediation Protocol In Progress
          </div>

          <div className="p-3.5 rounded-[8px] bg-white/[0.05] border border-[#3FB68B]/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono-tech">
              <span className="text-[#BCC4CF]">Active Step:</span>
              <span className="text-[#3FB68B] font-bold">Step {recoveryStep} of 6</span>
            </div>
            <div className="text-[13px] font-medium text-[#F5F7FA]">
              {recoveryStepText}
            </div>
            {/* Progress bar */}
            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#3FB68B] h-full transition-all duration-300"
                style={{ width: `${(recoveryStep / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* RESOLVED STATE */}
      {phase === 'resolved' && (
        <div className="flex-1 flex flex-col justify-center p-3 space-y-3">
          <div className="p-4 rounded-[8px] bg-white/[0.05] border border-[#3FB68B]/30 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#3FB68B]/10 border border-[#3FB68B]/30 flex items-center justify-center mx-auto text-[#3FB68B]">
              <CheckCircle size={20} />
            </div>
            <h4 className="text-[14px] font-semibold text-[#F5F7FA]">Incident Resolved</h4>
            <p className="text-[12px] text-[#BCC4CF] leading-relaxed max-w-sm mx-auto">
              {resolvedSummary || 'Payment failure averted. Predicted ~4 min ahead, recovered in 42 s (simulated).'}
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE INCIDENT STATE */}
      {phase === 'incident' && analysis && (
        <div className="flex-1 flex flex-col justify-between space-y-3 text-[12px]">
          {/* Root Cause Card */}
          <div className="p-3 rounded-[8px] bg-white/[0.05] border border-white/8 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-tech tracking-wider uppercase font-semibold text-[#8E99A8]">
                Probable Root Cause
              </span>
              <span className="px-2 py-0.5 rounded bg-[#E5584F]/15 border border-[#E5584F]/30 text-[11px] font-mono-tech font-bold text-[#E5584F]">
                {analysis.rootCause.confidence}% CONFIDENCE
              </span>
            </div>
            <h4 className="text-[14px] font-semibold text-[#F5F7FA]">
              {analysis.rootCause.label}
            </h4>

            {/* Mono Evidence lines */}
            <div className="mt-2 space-y-1 bg-black/35 p-2 rounded-[6px] border border-white/6 font-mono-tech text-[10.5px]">
              {analysis.rootCause.evidence.map((line, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[#BCC4CF]">
                  <span className="text-[#67E8F9]">›</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cascade Path Stepper */}
          <div className="p-3 rounded-[8px] bg-white/[0.05] border border-white/8">
            <span className="text-[10px] font-mono-tech tracking-wider uppercase font-semibold text-[#8E99A8] block mb-2">
              Predicted Cascade Vector (Propagation Path)
            </span>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {analysis.cascadePath.map((node, i) => {
                const sName = SERVICES[node.serviceId]?.name || node.serviceId;
                const isLast = i === analysis.cascadePath.length - 1;
                return (
                  <React.Fragment key={node.serviceId}>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/35 border border-white/10 flex-shrink-0">
                      <StatusGlyph status={node.state} size={10} />
                      <span className="text-[11px] font-mono-tech text-[#F5F7FA] font-medium">
                        {sName}
                      </span>
                    </div>
                    {!isLast && <ArrowRight size={12} className="text-[#7F8A99] flex-shrink-0" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Predicted Impact */}
          <div className="p-2.5 rounded-[8px] bg-white/[0.05] border border-white/8">
            <span className="text-[10px] font-mono-tech tracking-wider uppercase font-semibold text-[#8E99A8] block mb-1">
              Downstream Impact Summary
            </span>
            <p className="text-[12px] text-[#BCC4CF] leading-snug">
              Payment transaction retries are compounding thread pool exhaustion. Ingress Gateway error rates will climb to critical within ~6 minutes without intervention.
            </p>
          </div>

          {/* Why This Matters */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono-tech tracking-wider uppercase font-semibold text-[#8E99A8] block">
              Why This Matters
            </span>
            <div className="space-y-1">
              {analysis.reasoning.whyThisMatters.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11.5px] text-[#BCC4CF]">
                  <span className="text-[#67E8F9] mt-0.5">•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Microcopy & Provenance Chip */}
      <div className="pt-3 mt-3 border-t border-white/6 flex items-center justify-between text-[10px] font-mono-tech text-[#8E99A8]">
        <span>Simulated telemetry. Probabilities are model outputs.</span>
        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[#67E8F9]">
          {analysis?.source === 'deterministic+language'
            ? 'Deterministic + Language'
            : 'Deterministic model'}
        </span>
      </div>
    </Card>
  );
};
