import React, { useState } from 'react';
import { MetricPoint, ServiceRuntimeState, ServiceId } from '../../domain/types';
import { SERVICE_LIST } from '../../domain/services';
import { Card } from '../primitives/Card';
import { BarChart3, TrendingUp, Activity, AlertOctagon } from 'lucide-react';

interface AnalyticsChartsProps {
  metrics: MetricPoint[];
  services: Record<ServiceId, ServiceRuntimeState>;
  fullSize?: boolean;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  metrics,
  services,
  fullSize = false,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Safety fallback if no metrics yet
  const points = metrics.length > 0 ? metrics : [{
    time: '12:41:00',
    databaseP95: 34,
    paymentP95: 96,
    gatewayP95: 124,
    gatewayErrorRate: 0.2,
    paymentRiskProb: 0,
    gatewayRiskProb: 0,
    frontendRiskProb: 0,
  }];

  const width = 360;
  const height = fullSize ? 140 : 85;

  // Chart 1: Latency Trend (Database, Payment, Gateway)
  const maxLatency = Math.max(200, ...points.map((p) => Math.max(p.databaseP95, p.paymentP95, p.gatewayP95)));
  const getX = (idx: number) => (idx / (Math.max(1, points.length - 1))) * (width - 20) + 10;
  const getY = (val: number) => height - 12 - (val / maxLatency) * (height - 24);

  const dbPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.databaseP95)}`).join(' ');
  const payPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.paymentP95)}`).join(' ');
  const gwPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.gatewayP95)}`).join(' ');

  // Chart 2: Gateway Error Rate
  const maxErr = Math.max(2, ...points.map((p) => p.gatewayErrorRate));
  const getErrY = (val: number) => height - 12 - (val / maxErr) * (height - 24);
  const errPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getErrY(p.gatewayErrorRate)}`).join(' ');
  const errArea = `${errPath} L ${getX(points.length - 1)} ${height - 12} L ${getX(0)} ${height - 12} Z`;

  // Chart 4: Cascade Probability Trend (Payment, Gateway, Frontend)
  const getProbY = (prob: number) => height - 12 - Math.min(1, Math.max(0, prob)) * (height - 24);
  const payProbPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getProbY(p.paymentRiskProb)}`).join(' ');
  const gwProbPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getProbY(p.gatewayRiskProb)}`).join(' ');

  const latest = points[points.length - 1] || points[0];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 ${fullSize ? 'gap-4' : ''}`}>
      {/* 1. Latency Trend */}
      <Card className="p-3 bg-white/[0.035] border-white/8 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono-tech tracking-wider uppercase font-semibold text-[#8E99A8] flex items-center gap-1.5">
            <Activity size={12} className="text-[#67E8F9]" />
            Latency Trend (p95)
          </span>
          <span className="text-[10px] font-mono-tech text-[#67E8F9]">
            DB {latest.databaseP95}ms
          </span>
        </div>

        <div className="relative w-full h-[90px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Horizontal Gridlines */}
            <line x1="10" y1={height * 0.25} x2={width - 10} y2={height * 0.25} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
            <line x1="10" y1={height * 0.5} x2={width - 10} y2={height * 0.5} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
            <line x1="10" y1={height * 0.75} x2={width - 10} y2={height * 0.75} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />

            {/* Path lines: 1.5px, no dots */}
            <path d={dbPath} fill="none" stroke="#E5584F" strokeWidth={1.5} />
            <path d={payPath} fill="none" stroke="#E3A33B" strokeWidth={1.5} />
            <path d={gwPath} fill="none" stroke="#67E8F9" strokeWidth={1.5} />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[9.5px] font-mono-tech text-[#8E99A8] mt-1 pt-1 border-t border-white/6">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#E5584F]" /> DB</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#E3A33B]" /> Payment</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#67E8F9]" /> Gateway</span>
        </div>
      </Card>

      {/* 2. Error Rate (Gateway) */}
      <Card className="p-3 bg-white/[0.035] border-white/8 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono-tech tracking-wider uppercase font-semibold text-[#8E99A8] flex items-center gap-1.5">
            <AlertOctagon size={12} className="text-[#E5584F]" />
            Gateway Error Rate
          </span>
          <span className={`text-[10px] font-mono-tech font-bold ${latest.gatewayErrorRate > 1 ? 'text-[#E5584F]' : 'text-[#3FB68B]'}`}>
            {latest.gatewayErrorRate}%
          </span>
        </div>

        <div className="relative w-full h-[90px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="err-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E5584F" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#E5584F" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1="10" y1={height * 0.5} x2={width - 10} y2={height * 0.5} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
            <path d={errArea} fill="url(#err-grad)" />
            <path d={errPath} fill="none" stroke="#E5584F" strokeWidth={1.5} />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[9.5px] font-mono-tech text-[#8E99A8] mt-1 pt-1 border-t border-white/6">
          <span>HTTP 5xx Ingress SLA</span>
          <span>Target &lt;0.5%</span>
        </div>
      </Card>

      {/* 3. Service Health (8 Horizontal Bars) */}
      <Card className="p-3 bg-white/[0.035] border-white/8 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono-tech tracking-wider uppercase font-semibold text-[#8E99A8] flex items-center gap-1.5">
            <BarChart3 size={12} className="text-[#3FB68B]" />
            Fleet Health (8 Services)
          </span>
          <span className="text-[10px] font-mono-tech text-[#3FB68B]">
            Fleet Nominal
          </span>
        </div>

        <div className="space-y-1.5 py-1">
          {SERVICE_LIST.slice(0, 4).map((s) => {
            const st = services[s.id];
            const score = st.status === 'healthy' ? 99 : st.status === 'recovering' ? 92 : st.status === 'at-risk' ? 58 : 34;
            const barBg = score > 80 ? 'bg-[#3FB68B]' : score > 50 ? 'bg-[#E3A33B]' : 'bg-[#E5584F]';

            return (
              <div key={s.id} className="flex items-center justify-between gap-2 text-[10px] font-mono-tech">
                <span className="text-[#BCC4CF] truncate w-24">{s.name}</span>
                <div className="flex-1 bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${barBg}`} style={{ width: `${score}%` }} />
                </div>
                <span className="text-[#8E99A8] w-7 text-right">{score}%</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[9.5px] font-mono-tech text-[#8E99A8] mt-1 pt-1 border-t border-white/6">
          <span>8 / 8 Monitored</span>
          <span>Synthetic Probes</span>
        </div>
      </Card>

      {/* 4. Cascade Probability (3 Predicted Services Over Time) */}
      <Card className="p-3 bg-white/[0.035] border-white/8 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono-tech tracking-wider uppercase font-semibold text-[#8E99A8] flex items-center gap-1.5">
            <TrendingUp size={12} className="text-[#E3A33B]" />
            Cascade Probability
          </span>
          <span className="text-[10px] font-mono-tech text-[#E3A33B]">
            {Math.round(latest.paymentRiskProb * 100)}% Max
          </span>
        </div>

        <div className="relative w-full h-[90px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <line x1="10" y1={height * 0.5} x2={width - 10} y2={height * 0.5} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
            <path d={payProbPath} fill="none" stroke="#E5584F" strokeWidth={1.5} />
            <path d={gwProbPath} fill="none" stroke="#E3A33B" strokeWidth={1.5} />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[9.5px] font-mono-tech text-[#8E99A8] mt-1 pt-1 border-t border-white/6">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#E5584F]" /> Payment</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#E3A33B]" /> Gateway</span>
          <span>Rolling 90s</span>
        </div>
      </Card>
    </div>
  );
};
