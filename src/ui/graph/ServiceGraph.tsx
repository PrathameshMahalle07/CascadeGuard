import React, { useState, useMemo } from 'react';
import { ServiceId, ServiceRuntimeState, SeverityLevel } from '../../domain/types';
import { SERVICES, DEPENDENCY_EDGES, SERVICE_LIST } from '../../domain/services';
import { SCENARIO_LIST } from '../../domain/scenarios';
import { PhysicalButton } from '../primitives/PhysicalButton';
import { StatusGlyph } from '../primitives/StatusGlyph';
import { Card } from '../primitives/Card';
import { AlertCircle, Flame, Layers, X, ShieldAlert, Cpu, ArrowDown } from 'lucide-react';

interface ServiceGraphProps {
  services: Record<ServiceId, ServiceRuntimeState>;
  scenarioId: string;
  severityLevel: SeverityLevel;
  phase: string;
  onScenarioChange: (id: string) => void;
  onSeverityChange: (level: SeverityLevel) => void;
  onSimulate: () => void;
  inspectingServiceId: ServiceId | null;
  onInspectService: (id: ServiceId | null) => void;
}

const NODE_WIDTH = 132;
const NODE_HEIGHT = 52;

export const ServiceGraph: React.FC<ServiceGraphProps> = ({
  services,
  scenarioId,
  severityLevel,
  phase,
  onScenarioChange,
  onSeverityChange,
  onSimulate,
  inspectingServiceId,
  onInspectService,
}) => {
  const [hoveredNode, setHoveredNode] = useState<ServiceId | null>(null);

  // Active scenario definition
  const currentScenario = useMemo(
    () => SCENARIO_LIST.find((s) => s.id === scenarioId) || SCENARIO_LIST[0],
    [scenarioId]
  );

  // Calculate blast radius for hovered node (all upstream and downstream connected nodes)
  const blastRadius = useMemo(() => {
    if (!hoveredNode) return null;
    const connected = new Set<ServiceId>([hoveredNode]);

    // Find upstream (dependents)
    const queueUp = [hoveredNode];
    while (queueUp.length > 0) {
      const curr = queueUp.shift()!;
      for (const edge of DEPENDENCY_EDGES) {
        if (edge.to === curr && !connected.has(edge.from)) {
          connected.add(edge.from);
          queueUp.push(edge.from);
        }
      }
    }

    // Find downstream (dependencies)
    const queueDown = [hoveredNode];
    while (queueDown.length > 0) {
      const curr = queueDown.shift()!;
      for (const edge of DEPENDENCY_EDGES) {
        if (edge.from === curr && !connected.has(edge.to)) {
          connected.add(edge.to);
          queueDown.push(edge.to);
        }
      }
    }

    return connected;
  }, [hoveredNode]);

  // Edges on the active cascade path
  const cascadeEdges = useMemo(() => {
    const set = new Set<string>();
    for (const edge of DEPENDENCY_EDGES) {
      const fromState = services[edge.from]?.status;
      const toState = services[edge.to]?.status;
      if (
        (toState === 'critical' || toState === 'degraded') &&
        (fromState === 'degraded' || fromState === 'at-risk' || fromState === 'critical')
      ) {
        set.add(`${edge.from}->${edge.to}`);
      }
    }
    return set;
  }, [services]);

  const inspectedService = inspectingServiceId ? services[inspectingServiceId] : null;
  const inspectedDef = inspectingServiceId ? SERVICES[inspectingServiceId] : null;

  return (
    <Card className="flex flex-col relative overflow-hidden bg-white/[0.035] border-white/8">
      {/* Docked Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 border-b border-white/6 bg-white/[0.04] backdrop-blur min-w-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
          {/* Scenario Select */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-[10.5px] sm:text-[11px] font-mono-tech uppercase font-semibold text-[#8E99A8] flex-shrink-0">
              Scenario:
            </span>
            <select
              value={scenarioId}
              disabled={phase !== 'healthy'}
              onChange={(e) => onScenarioChange(e.target.value)}
              className="bg-black/35 text-[#F5F7FA] text-[11px] sm:text-[12px] font-mono-tech border border-white/10 rounded-[6px] px-2 py-1 sm:px-2.5 sm:py-1.5 focus:outline-none focus:border-[#67E8F9] disabled:opacity-50 transition-colors max-w-[170px] xs:max-w-[210px] sm:max-w-none truncate"
            >
              {SCENARIO_LIST.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  {scen.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Segmented Control */}
          <div className="flex items-center gap-1 bg-black/35 p-0.5 sm:p-1 rounded-[6px] border border-white/8 flex-shrink-0">
            <span className="text-[9.5px] sm:text-[10px] font-mono-tech text-[#8E99A8] px-1 uppercase font-semibold">
              Sev:
            </span>
            {(['medium', 'high', 'critical'] as SeverityLevel[]).map((level) => {
              const isSelected = severityLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  disabled={phase !== 'healthy'}
                  onClick={() => onSeverityChange(level)}
                  className={`px-1.5 sm:px-2 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-mono-tech uppercase transition-all ${
                    isSelected
                      ? 'bg-white/15 text-[#F5F7FA] font-bold shadow-sm'
                      : 'text-[#8E99A8] hover:text-[#BCC4CF]'
                  } disabled:opacity-40`}
                >
                  {level === 'critical' ? 'Crit 0.95' : level === 'medium' ? 'Med 0.60' : 'High 0.90'}
                </button>
              );
            })}
          </div>

          {/* Derived Impact Chip */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/[0.09] border border-white/6 text-[11px] font-mono-tech text-[#BCC4CF]">
            <Flame size={12} className="text-[#E3A33B]" />
            <span className="text-[#8E99A8]">Blast Radius:</span>
            <span className="text-[#F5F7FA] font-medium">{currentScenario.impactSummary}</span>
          </div>
        </div>

        {/* Tactile SIMULATE FAILURE Button */}
        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-shrink-0">
          <PhysicalButton
            variant="simulate"
            disabled={phase !== 'healthy'}
            onClick={onSimulate}
            shortcut="S"
            icon={<AlertCircle size={14} className="text-[#E3A33B]" />}
          >
            {phase === 'healthy' ? 'Simulate Failure' : 'Simulation Active'}
          </PhysicalButton>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-x-auto min-h-[380px] p-2 flex items-center justify-center">
        <svg
          viewBox="0 0 820 400"
          className="w-full max-w-[820px] h-auto select-none"
          style={{ minWidth: '720px' }}
          role="img"
          aria-label="Service Dependency Graph"
        >
          <defs>
            {/* Arrow marker for request flows (top down) */}
            <marker
              id="arrow-down"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="rgba(255,255,255,0.25)" />
            </marker>

            {/* Glowing marker for active cascade edges */}
            <marker
              id="arrow-cascade"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#E5584F" />
            </marker>

            <linearGradient id="grad-crit" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A1719" />
              <stop offset="100%" stopColor="#1A1214" />
            </linearGradient>

            <linearGradient id="grad-warn" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A2215" />
              <stop offset="100%" stopColor="#191612" />
            </linearGradient>

            <linearGradient id="grad-healthy" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#171C22" />
              <stop offset="100%" stopColor="#11151A" />
            </linearGradient>
          </defs>

          {/* EDGES */}
          {DEPENDENCY_EDGES.map((edge) => {
            const fromDef = SERVICES[edge.from];
            const toDef = SERVICES[edge.to];
            const edgeKey = `${edge.from}->${edge.to}`;
            const isCascading = cascadeEdges.has(edgeKey);

            // Connect bottom of `from` (dependent) to top of `to` (dependency) or appropriate boundary
            const x1 = fromDef.x;
            const y1 = fromDef.y + NODE_HEIGHT / 2;
            const x2 = toDef.x;
            const y2 = toDef.y - NODE_HEIGHT / 2;

            // Curved cubic bezier
            const dy = Math.abs(y2 - y1);
            const pathData = `M ${x1} ${y1} C ${x1} ${y1 + dy * 0.5}, ${x2} ${y2 - dy * 0.5}, ${x2} ${y2}`;

            const isDimmed = blastRadius && (!blastRadius.has(edge.from) || !blastRadius.has(edge.to));

            return (
              <g key={edgeKey} opacity={isDimmed ? 0.2 : 1} className="transition-opacity duration-200">
                {/* Background edge line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isCascading ? '#E5584F' : 'rgba(255,255,255,0.12)'}
                  strokeWidth={isCascading ? 2.5 : 1.2}
                  strokeDasharray={isCascading ? '6 4' : undefined}
                  className={isCascading ? 'flow-edge' : ''}
                  markerEnd={isCascading ? 'url(#arrow-cascade)' : 'url(#arrow-down)'}
                />
                {/* Edge weight badge */}
                <rect
                  x={(x1 + x2) / 2 - 14}
                  y={(y1 + y2) / 2 - 8}
                  width={28}
                  height={15}
                  rx={3}
                  fill="#0B0D10"
                  stroke={isCascading ? '#E5584F' : 'rgba(255,255,255,0.08)'}
                  strokeWidth={0.8}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 + 3}
                  textAnchor="middle"
                  fill={isCascading ? '#E5584F' : '#7C8591'}
                  fontSize={9}
                  fontFamily="Geist Mono, ui-monospace, monospace"
                  fontWeight="600"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* NODES */}
          {SERVICE_LIST.map((def) => {
            const sState = services[def.id];
            const isHovered = hoveredNode === def.id;
            const isInspected = inspectingServiceId === def.id;
            const isDimmed = blastRadius && !blastRadius.has(def.id);

            const x = def.x - NODE_WIDTH / 2;
            const y = def.y - NODE_HEIGHT / 2;

            let nodeStroke = 'rgba(255,255,255,0.08)';
            let nodeFill = 'url(#grad-healthy)';
            let strokeDash = undefined;

            if (sState.status === 'critical') {
              nodeStroke = '#E5584F';
              nodeFill = 'url(#grad-crit)';
            } else if (sState.status === 'degraded') {
              nodeStroke = '#E3A33B';
              nodeFill = 'url(#grad-warn)';
            } else if (sState.status === 'at-risk') {
              nodeStroke = '#E3A33B';
              nodeFill = 'url(#grad-warn)';
              strokeDash = '4 3';
            } else if (sState.status === 'recovering') {
              nodeStroke = '#3FB68B';
              nodeFill = 'url(#grad-healthy)';
            }

            if (isInspected) {
              nodeStroke = '#67E8F9';
            }

            return (
              <g
                key={def.id}
                transform={`translate(${x}, ${y})`}
                opacity={isDimmed ? 0.25 : 1}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredNode(def.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onInspectService(inspectingServiceId === def.id ? null : def.id)}
                role="button"
                tabIndex={0}
                aria-label={`${def.name}, ${sState.status}, p95 ${sState.currentP95} ms`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onInspectService(def.id);
                  if (e.key === 'Escape') onInspectService(null);
                }}
              >
                {/* Outer focus/pulse glow if critical */}
                {sState.status === 'critical' && (
                  <rect
                    x={-4}
                    y={-4}
                    width={NODE_WIDTH + 8}
                    height={NODE_HEIGHT + 8}
                    rx={12}
                    fill="none"
                    stroke="#E5584F"
                    strokeWidth={1.5}
                    opacity={0.4}
                    className="pulse-critical"
                  />
                )}

                {/* Node Card Rectangle */}
                <rect
                  x={0}
                  y={0}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={8}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth={isInspected || isHovered ? 1.8 : 1}
                  strokeDasharray={strokeDash}
                />

                {/* Service Name Header */}
                <text
                  x={12}
                  y={19}
                  fill="#F5F7FA"
                  fontSize={12}
                  fontWeight={500}
                  letterSpacing="-0.01em"
                >
                  {def.name}
                </text>

                {/* Status Indicator Icon & Text */}
                <g transform="translate(12, 34)">
                  <circle
                    cx={4}
                    cy={-3}
                    r={3.5}
                    fill={
                      sState.status === 'critical'
                        ? '#E5584F'
                        : sState.status === 'degraded' || sState.status === 'at-risk'
                        ? '#E3A33B'
                        : '#3FB68B'
                    }
                  />
                  <text
                    x={12}
                    y={0}
                    fill={
                      sState.status === 'critical'
                        ? '#E5584F'
                        : sState.status === 'degraded' || sState.status === 'at-risk'
                        ? '#E3A33B'
                        : '#3FB68B'
                    }
                    fontSize={9.5}
                    fontFamily="Geist Mono, ui-monospace, monospace"
                    fontWeight="600"
                    letterSpacing="0.04em"
                  >
                    {sState.status.toUpperCase()}
                  </text>
                </g>

                {/* Live p95 Latency Badge */}
                <text
                  x={NODE_WIDTH - 10}
                  y={34}
                  textAnchor="end"
                  fill="#A7AFBA"
                  fontSize={10.5}
                  fontFamily="Geist Mono, ui-monospace, monospace"
                  fontWeight="500"
                >
                  {sState.currentP95}ms
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-4 text-[10px] font-mono-tech text-[#8E99A8] bg-black/45 px-2.5 py-1 rounded-[6px] border border-white/6 backdrop-blur">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-[1.5px] bg-white/40" />
            <span>Requests (↓ Top-down)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-[2px] bg-[#E5584F]" />
            <span className="text-[#E5584F]">Failure Propagation (↑ Bottom-up)</span>
          </div>
        </div>

        {/* Node Inspector Overlay */}
        {inspectedService && inspectedDef && (
          <div className="absolute top-3 right-3 w-[260px] bg-white/[0.04] border border-[#67E8F9]/30 rounded-[10px] p-3.5 shadow-2xl backdrop-blur z-20">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/8">
              <div>
                <h4 className="text-[13px] font-semibold text-[#F5F7FA]">{inspectedDef.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StatusGlyph status={inspectedService.status} size={11} showLabel />
                </div>
              </div>
              <button
                type="button"
                onClick={() => onInspectService(null)}
                className="text-[#8E99A8] hover:text-[#F5F7FA] p-1 rounded"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 text-[11px] font-mono-tech">
              <div className="flex justify-between items-center py-1 px-2 rounded bg-white/4">
                <span className="text-[#8E99A8]">p95 Latency:</span>
                <span className={`font-semibold ${inspectedService.currentP95 > inspectedDef.baselineP95 * 2 ? 'text-[#E5584F]' : 'text-[#F5F7FA]'}`}>
                  {inspectedService.currentP95} ms (base: {inspectedDef.baselineP95}ms)
                </span>
              </div>

              <div className="flex justify-between items-center py-1 px-2 rounded bg-white/4">
                <span className="text-[#8E99A8]">Error Rate:</span>
                <span className="text-[#F5F7FA]">{inspectedService.currentErrorRate}%</span>
              </div>

              <div className="flex justify-between items-center py-1 px-2 rounded bg-white/4">
                <span className="text-[#8E99A8]">Thread Saturation:</span>
                <span className="text-[#F5F7FA]">{inspectedService.saturation}%</span>
              </div>

              <div className="pt-1">
                <span className="text-[10px] text-[#8E99A8] uppercase block mb-1">Depends On:</span>
                <div className="flex flex-wrap gap-1">
                  {inspectedDef.dependencies.length > 0 ? (
                    inspectedDef.dependencies.map((d) => (
                      <span key={d} className="px-1.5 py-0.5 rounded bg-white/6 text-[10px] text-[#BCC4CF]">
                        {SERVICES[d].name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#7F8A99] text-[10px]">None (Terminal)</span>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[10px] text-[#8E99A8] uppercase block mb-1">Depended On By:</span>
                <div className="flex flex-wrap gap-1">
                  {inspectedDef.dependents.length > 0 ? (
                    inspectedDef.dependents.map((d) => (
                      <span key={d} className="px-1.5 py-0.5 rounded bg-white/6 text-[10px] text-[#BCC4CF]">
                        {SERVICES[d].name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#7F8A99] text-[10px]">None (Ingress edge)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
