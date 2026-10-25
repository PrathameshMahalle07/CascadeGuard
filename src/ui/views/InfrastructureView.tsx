import React from 'react';
import { SimState } from '../../sim/useSimulation';
import { SERVICE_LIST, SERVICES } from '../../domain/services';
import { ServiceGraph } from '../graph/ServiceGraph';
import { Card } from '../primitives/Card';
import { StatusGlyph } from '../primitives/StatusGlyph';
import { Network, Server } from 'lucide-react';
import { SeverityLevel, ServiceId } from '../../domain/types';

interface InfrastructureViewProps {
  state: SimState;
  onScenarioChange: (id: string) => void;
  onSeverityChange: (level: SeverityLevel) => void;
  onSimulate: () => void;
  onInspectService: (id: ServiceId | null) => void;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({
  state,
  onScenarioChange,
  onSeverityChange,
  onSimulate,
  onInspectService,
}) => {
  return (
    <div className="space-y-5">
      {/* Topology Graph Card */}
      <ServiceGraph
        services={state.services}
        scenarioId={state.scenarioId}
        severityLevel={state.severityLevel}
        phase={state.phase}
        onScenarioChange={onScenarioChange}
        onSeverityChange={onSeverityChange}
        onSimulate={onSimulate}
        inspectingServiceId={state.inspectingServiceId}
        onInspectService={onInspectService}
      />

      {/* Complete Infrastructure Service Table */}
      <Card className="p-4 bg-white/[0.035] border-white/8">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/6">
          <div className="flex items-center gap-2">
            <Server size={15} className="text-[#67E8F9]" />
            <h3 className="text-[13px] font-semibold text-[#F5F7FA]">
              Active Fleet Status ({SERVICE_LIST.length} Microservices)
            </h3>
          </div>
          <span className="text-[10px] font-mono-tech text-[#8E99A8]">
            SYNTHETIC HEARTBEAT ACTIVE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-tech text-[11.5px]">
            <thead>
              <tr className="border-b border-white/6 text-[10px] text-[#8E99A8] uppercase">
                <th className="pb-2 font-medium">Service</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">p95 Latency</th>
                <th className="pb-2 font-medium">Error Rate</th>
                <th className="pb-2 font-medium">Thread Pool</th>
                <th className="pb-2 font-medium">Direct Dependencies</th>
                <th className="pb-2 font-medium">Dependents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {SERVICE_LIST.map((svc) => {
                const rt = state.services[svc.id];
                const isOverdue = rt.currentP95 > svc.baselineP95 * 2;

                return (
                  <tr
                    key={svc.id}
                    onClick={() => onInspectService(svc.id)}
                    className="hover:bg-white/3 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 font-medium text-[#F5F7FA]">
                      {svc.name}
                    </td>
                    <td className="py-2.5">
                      <StatusGlyph status={rt.status} size={11} showLabel />
                    </td>
                    <td className="py-2.5">
                      <span className={isOverdue ? 'text-[#E5584F] font-bold' : 'text-[#BCC4CF]'}>
                        {rt.currentP95} ms
                      </span>{' '}
                      <span className="text-[#7F8A99] text-[10px]">({svc.baselineP95}ms)</span>
                    </td>
                    <td className="py-2.5 text-[#BCC4CF]">
                      {rt.currentErrorRate}%
                    </td>
                    <td className="py-2.5 text-[#BCC4CF]">
                      {rt.saturation}%
                    </td>
                    <td className="py-2.5 text-[#8E99A8]">
                      {svc.dependencies.length > 0
                        ? svc.dependencies.map((d) => SERVICES[d].name).join(', ')
                        : 'None'}
                    </td>
                    <td className="py-2.5 text-[#8E99A8]">
                      {svc.dependents.length > 0
                        ? svc.dependents.map((d) => SERVICES[d].name).join(', ')
                        : 'None'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
