import React, { useState } from 'react';
import { IncidentReport } from '../../domain/types';
import { Card } from '../primitives/Card';
import {
  FileText,
  Download,
  Copy,
  Printer,
  CheckCircle,
  Share2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface IncidentReportViewProps {
  report: IncidentReport | null;
  onClose?: () => void;
}

export const IncidentReportView: React.FC<IncidentReportViewProps> = ({ report, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!report) {
    return (
      <Card className="p-8 bg-white/[0.035] border-white/8 text-center max-w-lg mx-auto my-12 space-y-3">
        <FileText size={24} className="text-[#8E99A8] mx-auto" />
        <h4 className="text-[14px] font-medium text-[#F5F7FA]">No Incident Record Selected</h4>
        <p className="text-[12px] text-[#8E99A8]">
          Execute a simulated failure and recovery cycle to generate a full post-mortem incident intelligence report.
        </p>
      </Card>
    );
  }

  const handleCopyMarkdown = () => {
    const md = `
# INCIDENT POST-MORTEM REPORT: ${report.incidentId}
- **Timestamp:** ${report.timestamp}
- **Scenario:** ${report.scenarioName} (${report.severity})
- **Root Cause:** ${report.rootCause} (${report.confidence}% confidence)
- **Cascade Vector:** ${report.cascadePath.join(' → ')}
- **Blast Radius Avoided:** ${report.blastRadiusMetrics.blastRadiusAvoidedPct}% (${report.blastRadiusMetrics.servicesProtected} services sheltered)
- **Remediation Action:** ${report.recoveryStrategyTaken} (${report.recoveryDurationSec}s elapsed)
- **Final Health:** ${report.finalHealthScore}% Nominal

## Executive Summary
${report.commanderNotes}

## Root Cause Evidence
${report.evidence.map((e) => `- ${e}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 min-w-0">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/6 min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <FileText size={18} className="text-[#67E8F9] flex-shrink-0" />
          <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#F5F7FA] break-words">
            SRE Incident Post-Mortem Report
          </h2>
          <span className="text-[10.5px] sm:text-[11px] font-mono-tech px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[#67E8F9] flex-shrink-0">
            {report.incidentId}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white/[0.05] border border-white/8 text-[11px] font-mono-tech text-[#BCC4CF] hover:text-[#F5F7FA] transition-colors"
          >
            {copied ? <CheckCircle size={12} className="text-[#3FB68B]" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#67E8F9] text-[#06222A] text-[11px] font-mono-tech font-bold hover:brightness-105 transition-all"
          >
            <Printer size={12} />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <Card className="p-4 sm:p-6 bg-black/25 border-white/10 space-y-6 print:border-none print:bg-white print:text-black min-w-0">
        {/* Document Header */}
        <div className="border-b border-white/8 pb-4 flex flex-wrap justify-between items-start gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-[10px] font-mono-tech text-[#67E8F9] uppercase font-bold tracking-wider">
              CASCADEGUARD AI · INCIDENT GOVERNANCE
            </div>
            <h1 className="text-[16px] sm:text-[18px] font-bold text-[#F5F7FA] mt-1 break-words">
              Automated Incident Post-Mortem: {report.scenarioName}
            </h1>
            <div className="text-[11px] sm:text-[11.5px] font-mono-tech text-[#8E99A8] mt-1 break-words">
              Logged: {report.timestamp} · Target: Production Distributed Mesh
            </div>
          </div>

          <div className="text-left sm:text-right font-mono-tech flex-shrink-0">
            <span className="px-2.5 py-1 rounded bg-[#3FB68B]/15 border border-[#3FB68B]/30 text-[#3FB68B] font-bold text-[10.5px] sm:text-[11px]">
              STATUS: RESOLVED & NOMINAL
            </span>
          </div>
        </div>

        {/* Executive KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 font-mono-tech text-center">
          <div className="p-2.5 sm:p-3 rounded-[6px] bg-white/[0.05] border border-white/6 min-w-0">
            <span className="text-[9.5px] sm:text-[10px] text-[#8E99A8] uppercase block truncate">Root Confidence</span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#67E8F9] mt-1 block">{report.confidence}%</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-[6px] bg-white/[0.05] border border-white/6 min-w-0">
            <span className="text-[9.5px] sm:text-[10px] text-[#8E99A8] uppercase block truncate">Blast Avoided</span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#3FB68B] mt-1 block">
              {report.blastRadiusMetrics.blastRadiusAvoidedPct}%
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-[6px] bg-white/[0.05] border border-white/6 min-w-0">
            <span className="text-[9.5px] sm:text-[10px] text-[#8E99A8] uppercase block truncate">Recovery Elapsed</span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#F5F7FA] mt-1 block">
              {report.recoveryDurationSec}s
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-[6px] bg-white/[0.05] border border-white/6 min-w-0">
            <span className="text-[9.5px] sm:text-[10px] text-[#8E99A8] uppercase block truncate">Fleet Post-Health</span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#3FB68B] mt-1 block">{report.finalHealthScore}%</span>
          </div>
        </div>

        {/* Section 1: Root Cause & Telemetry Evidence */}
        <div className="space-y-2 min-w-0">
          <h3 className="text-[12.5px] sm:text-[13px] font-semibold text-[#F5F7FA] uppercase tracking-wide border-b border-white/6 pb-1">
            1. Root Cause Identification & Telemetry Grounding
          </h3>
          <p className="text-[12px] text-[#D0D6E0] break-words">
            Anomalous pattern isolated to <strong className="text-[#F5F7FA]">{report.rootCause}</strong> with {report.confidence}% statistical model confidence.
          </p>
          <div className="bg-black/35 p-3 rounded-[6px] border border-white/6 space-y-1 font-mono-tech text-[10.5px] sm:text-[11px] text-[#BCC4CF] min-w-0">
            {report.evidence.map((ev, i) => (
              <div key={i} className="flex items-start gap-2 min-w-0">
                <span className="text-[#67E8F9] flex-shrink-0 mt-0.5">›</span>
                <span className="break-words min-w-0 flex-1">{ev}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Cascade Propagation Vector */}
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-[#F5F7FA] uppercase tracking-wide border-b border-white/6 pb-1">
            2. Predicted Downstream Cascade Vector
          </h3>
          <div className="flex flex-wrap items-center gap-2 font-mono-tech text-[11px]">
            {report.cascadePath.map((s, i) => (
              <React.Fragment key={i}>
                <span className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/10 text-[#F5F7FA]">
                  {s}
                </span>
                {i < report.cascadePath.length - 1 && (
                  <span className="text-[#67E8F9] font-bold">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-[11.5px] text-[#8E99A8]">
            Backward traversal along weighted request edges confirmed synchronous coupling with exponential client retry amplification.
          </p>
        </div>

        {/* Section 3: Remediation Executed & Blast Radius Containment */}
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-[#F5F7FA] uppercase tracking-wide border-b border-white/6 pb-1">
            3. Remediation & Blast Radius Containment
          </h3>
          <p className="text-[12px] text-[#D0D6E0]">
            Selected Countermeasure: <strong className="text-[#3FB68B]">{report.recoveryStrategyTaken}</strong>.
          </p>
          <div className="p-3 rounded-[6px] bg-white/[0.05] border border-white/6 text-[12px] text-[#BCC4CF] leading-relaxed">
            {report.commanderNotes}
          </div>
        </div>

        {/* Sign-off Footer */}
        <div className="pt-4 border-t border-white/6 flex flex-wrap justify-between items-center text-[10px] font-mono-tech text-[#8E99A8]">
          <span>Generated by CascadeGuard AI Platform · Deterministic Core Engine</span>
          <span>Certified SRE Audit Record</span>
        </div>
      </Card>
    </div>
  );
};
