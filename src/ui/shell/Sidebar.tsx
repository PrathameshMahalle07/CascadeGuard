import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  Network,
  AlertTriangle,
  FileText,
  PlayCircle,
  ShieldCheck,
  BarChart2,
  Settings,
  Activity,
  Layers,
  X,
} from 'lucide-react';
import { StatusGlyph } from '../primitives/StatusGlyph';

export type NavView =
  | 'overview'
  | 'what-if'
  | 'infrastructure'
  | 'incidents'
  | 'report'
  | 'simulator'
  | 'recovery'
  | 'analytics';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: NavView; label: string; icon: React.ComponentType<{ size: number; className?: string }> }[] = [
  { id: 'overview', label: 'Command View', icon: LayoutDashboard },
  { id: 'what-if', label: 'What-If Lab', icon: Sliders },
  { id: 'infrastructure', label: 'Infrastructure', icon: Network },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'report', label: 'Incident Report', icon: FileText },
  { id: 'simulator', label: 'Simulator', icon: PlayCircle },
  { id: 'recovery', label: 'Recovery', icon: ShieldCheck },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop Scrim */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-[#06080B]/45 backdrop-blur-2xl backdrop-saturate-150 border-r border-white/10 transition-all duration-300 w-[208px] ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:w-[64px] xl:w-[208px]`}
      >
        {/* Top Logo & Brand */}
        <div>
          <div className="flex items-center justify-between h-[52px] px-4 border-b border-white/6">
            <div className="flex items-center gap-2.5">
              {/* Stepped Bars Logo Mark */}
              <div className="w-6 h-6 flex items-end gap-[3px] py-1">
                <span className="w-[4px] h-[8px] rounded-[1px] bg-[#67E8F9]/50" />
                <span className="w-[4px] h-[14px] rounded-[1px] bg-[#67E8F9]" />
                <span className="w-[4px] h-[20px] rounded-[1px] bg-[#67E8F9] shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
              </div>

              <div className="flex flex-col md:hidden xl:flex">
                <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-[#F5F7FA]">
                  CASCADEGUARD
                </span>
                <span className="text-[8.5px] font-mono-tech tracking-wider text-[#67E8F9] uppercase font-medium">
                  AI RELIABILITY INTELLIGENCE
                </span>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={onCloseMobile}
              className="md:hidden text-[#8E99A8] hover:text-[#F5F7FA] p-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-all ${
                    isSelected
                      ? 'bg-white/[0.07] text-[#F5F7FA] border border-[#67E8F9]/30 shadow-[0_0_22px_-4px_rgba(103,232,249,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]'
                      : 'text-[#BCC4CF] hover:text-[#F5F7FA] hover:bg-white/4'
                  }`}
                  title={item.label}
                >
                  <Icon
                    size={16}
                    className={`flex-shrink-0 ${
                      isSelected ? 'text-[#67E8F9]' : 'text-[#8E99A8]'
                    }`}
                  />
                  <span className="truncate md:hidden xl:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Settings & Status */}
        <div className="p-3 border-t border-white/6 space-y-2">
          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-[#BCC4CF] hover:text-[#F5F7FA] hover:bg-white/4 transition-colors"
            title="System Settings"
          >
            <Settings size={15} className="text-[#8E99A8] flex-shrink-0" />
            <span className="md:hidden xl:inline">Settings</span>
          </button>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-mono-tech text-[#8E99A8]">
            <span className="w-2 h-2 rounded-full bg-[#3FB68B] shadow-[0_0_6px_rgba(63,182,139,0.6)] flex-shrink-0" />
            <span className="md:hidden xl:inline truncate text-[#BCC4CF]">Monitoring active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
