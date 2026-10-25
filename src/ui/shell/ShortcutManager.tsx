import React, { useEffect, useState } from 'react';
import { NavView } from './Sidebar';
import { Card } from '../primitives/Card';
import {
  Keyboard,
  Command,
  Play,
  ShieldCheck,
  RotateCcw,
  Sliders,
  FileText,
  Search,
  X,
  Zap,
} from 'lucide-react';

interface ShortcutManagerProps {
  onRunIncident: () => void;
  onExecuteRecovery: () => void;
  onResetSystem: () => void;
  onSelectView: (view: NavView) => void;
  canRunIncident: boolean;
  canExecuteRecovery: boolean;
  canReset: boolean;
  isOpenPalette: boolean;
  onClosePalette: () => void;
  onOpenPalette: () => void;
}

export interface ShortcutDefinition {
  id: string;
  keys: string[];
  label: string;
  description: string;
  category: 'Incident Control' | 'Navigation' | 'System';
  action: () => void;
  disabled?: boolean;
}

export const ShortcutManager: React.FC<ShortcutManagerProps> = ({
  onRunIncident,
  onExecuteRecovery,
  onResetSystem,
  onSelectView,
  canRunIncident,
  canExecuteRecovery,
  canReset,
  isOpenPalette,
  onClosePalette,
  onOpenPalette,
}) => {
  const [hudMessage, setHudMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const triggerHud = (message: string) => {
    setHudMessage(message);
    const timer = setTimeout(() => {
      setHudMessage((curr) => (curr === message ? null : curr));
    }, 1800);
  };

  const shortcuts: ShortcutDefinition[] = [
    {
      id: 'run-incident',
      keys: ['Ctrl', 'R'],
      label: 'Run Incident',
      description: 'Trigger autonomous fault injection & cascade simulation',
      category: 'Incident Control',
      action: () => {
        if (canRunIncident) {
          triggerHud('Triggered: Run Incident');
          onRunIncident();
        } else {
          triggerHud('Incident already in progress or recovering');
        }
      },
      disabled: !canRunIncident,
    },
    {
      id: 'execute-recovery',
      keys: ['Ctrl', 'E'],
      label: 'Execute Recovery',
      description: 'Deploy AI-recommended remediation countermeasure',
      category: 'Incident Control',
      action: () => {
        if (canExecuteRecovery) {
          triggerHud('Triggered: Execute Recovery');
          onExecuteRecovery();
        } else {
          triggerHud('Recovery not currently applicable');
        }
      },
      disabled: !canExecuteRecovery,
    },
    {
      id: 'what-if-lab',
      keys: ['Ctrl', 'W'],
      label: 'Open What-If Lab',
      description: 'Navigate to counterfactual telemetry & parameter simulation',
      category: 'Navigation',
      action: () => {
        triggerHud('Navigated: What-If Lab');
        onSelectView('what-if');
        onClosePalette();
      },
    },
    {
      id: 'reset-system',
      keys: ['Ctrl', 'Shift', 'R'],
      label: 'Reset System Baseline',
      description: 'Cancel all active faults and restore 98.4% nominal baseline',
      category: 'System',
      action: () => {
        if (canReset) {
          triggerHud('Restored: Baseline Nominal State');
          onResetSystem();
        }
      },
      disabled: !canReset,
    },
    {
      id: 'command-palette',
      keys: ['Ctrl', 'K'],
      label: 'Command Palette',
      description: 'Search actions and view global keyboard shortcuts',
      category: 'System',
      action: () => {
        onOpenPalette();
      },
    },
    {
      id: 'view-overview',
      keys: ['Ctrl', '1'],
      label: 'Command View',
      description: 'Return to the primary SRE Command Center dashboard',
      category: 'Navigation',
      action: () => {
        triggerHud('Navigated: Command View');
        onSelectView('overview');
        onClosePalette();
      },
    },
    {
      id: 'view-report',
      keys: ['Ctrl', '4'],
      label: 'Incident Report',
      description: 'View post-mortem intelligence & audit documentation',
      category: 'Navigation',
      action: () => {
        triggerHud('Navigated: Incident Report');
        onSelectView('report');
        onClosePalette();
      },
    },
  ];

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form field
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement)?.blur();
          onClosePalette();
        }
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // 1. Run Incident: Ctrl+R / Cmd+R (or S when not modifier)
      if ((isCtrlOrCmd && (e.key === 'r' || e.key === 'R') && !e.shiftKey) || (!isCtrlOrCmd && (e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
        const sc = shortcuts.find((s) => s.id === 'run-incident');
        sc?.action();
        return;
      }

      // 2. Execute Recovery: Ctrl+E / Cmd+E (or E when not modifier)
      if ((isCtrlOrCmd && (e.key === 'e' || e.key === 'E')) || (!isCtrlOrCmd && (e.key === 'e' || e.key === 'E'))) {
        e.preventDefault();
        const sc = shortcuts.find((s) => s.id === 'execute-recovery');
        sc?.action();
        return;
      }

      // 3. Open What-If Lab: Ctrl+W / Cmd+W (or Ctrl+Shift+W or W)
      if ((isCtrlOrCmd && (e.key === 'w' || e.key === 'W')) || (!isCtrlOrCmd && (e.key === 'w' || e.key === 'W'))) {
        e.preventDefault();
        const sc = shortcuts.find((s) => s.id === 'what-if-lab');
        sc?.action();
        return;
      }

      // 4. Reset Baseline: Ctrl+Shift+R (or R when not modifier)
      if ((isCtrlOrCmd && e.shiftKey && (e.key === 'r' || e.key === 'R')) || (!isCtrlOrCmd && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        const sc = shortcuts.find((s) => s.id === 'reset-system');
        sc?.action();
        return;
      }

      // 5. Command Palette: Ctrl+K / Cmd+K or ?
      if ((isCtrlOrCmd && (e.key === 'k' || e.key === 'K')) || (!isCtrlOrCmd && e.key === '?')) {
        e.preventDefault();
        if (isOpenPalette) {
          onClosePalette();
        } else {
          onOpenPalette();
        }
        return;
      }

      // 6. Navigation Numbers: Ctrl+1, Ctrl+2, Ctrl+4
      if (isCtrlOrCmd && e.key === '1') {
        e.preventDefault();
        onSelectView('overview');
        triggerHud('Navigated: Command View');
      } else if (isCtrlOrCmd && e.key === '2') {
        e.preventDefault();
        onSelectView('what-if');
        triggerHud('Navigated: What-If Lab');
      } else if (isCtrlOrCmd && e.key === '4') {
        e.preventDefault();
        onSelectView('report');
        triggerHud('Navigated: Incident Report');
      }

      // 7. Escape closes palette
      if (e.key === 'Escape' && isOpenPalette) {
        e.preventDefault();
        onClosePalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, isOpenPalette, onClosePalette, onOpenPalette, onSelectView]);

  const filteredShortcuts = shortcuts.filter(
    (s) =>
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Heads-up Toast HUD when a shortcut fires */}
      {hudMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] bg-white/[0.09] border border-[#67E8F9]/40 text-[#F5F7FA] text-[12px] font-mono-tech shadow-2xl backdrop-blur-md">
            <Zap size={13} className="text-[#67E8F9]" />
            <span>{hudMessage}</span>
          </div>
        </div>
      )}

      {/* Command Palette & Keyboard Shortcut Modal (Ctrl+K or ?) */}
      {isOpenPalette && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-100">
          <Card
            elevation="s3"
            className="w-full max-w-xl glass--strong border-white/12 shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_60px_-20px_rgba(103,232,249,0.35)] overflow-hidden"
          >
            {/* Search Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/8 bg-white/[0.05]">
              <Search size={16} className="text-[#67E8F9]" />
              <input
                type="text"
                autoFocus
                placeholder="Search command palette or hotkey (Ctrl+R, Ctrl+E, Ctrl+W)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[13px] text-[#F5F7FA] font-sans placeholder-[#69727D] focus:outline-none"
              />
              <button
                onClick={onClosePalette}
                className="text-[#8E99A8] hover:text-[#F5F7FA] p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            {/* Shortcut List */}
            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredShortcuts.map((sc) => (
                <button
                  key={sc.id}
                  disabled={sc.disabled}
                  onClick={() => {
                    sc.action();
                    onClosePalette();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-[6px] text-left transition-colors font-sans ${
                    sc.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-white/6 focus:bg-white/8 focus:outline-none'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-medium text-[#F5F7FA]">{sc.label}</span>
                      <span className="text-[9.5px] font-mono-tech px-1.5 py-0.2 rounded bg-white/4 text-[#8E99A8] uppercase">
                        {sc.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#BCC4CF]">{sc.description}</div>
                  </div>

                  {/* Keycaps */}
                  <div className="flex items-center gap-1 font-mono-tech text-[11px] flex-shrink-0">
                    {sc.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2 py-1 rounded bg-black/35 border border-white/15 text-[#67E8F9] font-bold text-[10.5px] shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </button>
              ))}

              {filteredShortcuts.length === 0 && (
                <div className="py-6 text-center text-[#8E99A8] text-[12px] font-mono-tech">
                  No matching shortcuts found.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/6 bg-black/25 flex justify-between items-center text-[10.5px] font-mono-tech text-[#8E99A8]">
              <div className="flex items-center gap-3">
                <span>Select: <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">↵</kbd></span>
                <span>Close: <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">Esc</kbd></span>
              </div>
              <span className="text-[#67E8F9]">SRE POWER USER MODE</span>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
