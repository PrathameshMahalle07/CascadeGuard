import React from 'react';
import { SimSettings } from '../../domain/types';
import { Card } from '../primitives/Card';
import { X, Sliders, Zap, Eye, Bot, Keyboard } from 'lucide-react';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SimSettings;
  onUpdateSettings: (newSettings: SimSettings) => void;
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card
        elevation="s2"
        className="w-full max-w-md p-5 bg-white/[0.05] border-white/10 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#67E8F9]" />
            <h3 className="text-[14px] font-semibold text-[#F5F7FA]">Simulation Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E99A8] hover:text-[#F5F7FA] p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* 3 Working Toggles */}
        <div className="space-y-4">
          {/* Toggle 1: Simulation Speed */}
          <div className="flex items-center justify-between p-3 rounded-[8px] bg-white/[0.035] border border-white/6">
            <div className="flex items-start gap-2.5">
              <Zap size={16} className="text-[#E3A33B] mt-0.5" />
              <div>
                <div className="text-[12.5px] font-medium text-[#F5F7FA]">Simulation Velocity</div>
                <div className="text-[11px] text-[#8E99A8]">Speed up demo transitions and choreography</div>
              </div>
            </div>
            <div className="flex items-center bg-black/35 p-1 rounded-[6px] border border-white/8 font-mono-tech text-[11px]">
              <button
                onClick={() => onUpdateSettings({ ...settings, simSpeed: 1 })}
                className={`px-2.5 py-1 rounded-[4px] ${
                  settings.simSpeed === 1
                    ? 'bg-white/15 text-[#F5F7FA] font-bold'
                    : 'text-[#8E99A8] hover:text-[#BCC4CF]'
                }`}
              >
                1×
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, simSpeed: 2 })}
                className={`px-2.5 py-1 rounded-[4px] ${
                  settings.simSpeed === 2
                    ? 'bg-[#67E8F9]/20 text-[#67E8F9] font-bold'
                    : 'text-[#8E99A8] hover:text-[#BCC4CF]'
                }`}
              >
                2×
              </button>
            </div>
          </div>

          {/* Toggle 2: Reduce Motion */}
          <div className="flex items-center justify-between p-3 rounded-[8px] bg-white/[0.035] border border-white/6">
            <div className="flex items-start gap-2.5">
              <Eye size={16} className="text-[#67E8F9] mt-0.5" />
              <div>
                <div className="text-[12.5px] font-medium text-[#F5F7FA]">Reduce Motion</div>
                <div className="text-[11px] text-[#8E99A8]">Disable pulsing rings and SVG edge flow</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, reduceMotion: !settings.reduceMotion })}
              className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                settings.reduceMotion ? 'bg-[#67E8F9]' : 'bg-black/35 border border-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  settings.reduceMotion
                    ? 'translate-x-5 bg-[#06222A]'
                    : 'translate-x-0 bg-[#7C8591]'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: AI Language Analysis */}
          <div className="flex items-center justify-between p-3 rounded-[8px] bg-white/[0.035] border border-white/6">
            <div className="flex items-start gap-2.5">
              <Bot size={16} className="text-[#3FB68B] mt-0.5" />
              <div>
                <div className="text-[12.5px] font-medium text-[#F5F7FA]">AI Language Reasoning</div>
                <div className="text-[11px] text-[#8E99A8]">Structured synthesis layer for incident root cause</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, aiLanguageAnalysis: !settings.aiLanguageAnalysis })}
              className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                settings.aiLanguageAnalysis ? 'bg-[#67E8F9]' : 'bg-black/35 border border-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  settings.aiLanguageAnalysis
                    ? 'translate-x-5 bg-[#06222A]'
                    : 'translate-x-0 bg-[#7C8591]'
                }`}
              />
            </button>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="p-3 rounded-[8px] bg-black/35 border border-white/6 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-[#8E99A8]">
              <Keyboard size={13} className="text-[#67E8F9]" />
              <span className="uppercase font-semibold">Presenter Hotkeys</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono-tech">
              <div className="flex items-center justify-between p-1.5 rounded bg-white/4">
                <span className="text-[#BCC4CF]">Simulate:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[#67E8F9]">S</kbd>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-white/4">
                <span className="text-[#BCC4CF]">Execute:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[#67E8F9]">E</kbd>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-white/4">
                <span className="text-[#BCC4CF]">Reset:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[#67E8F9]">R</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-4 border-t border-white/6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[6px] bg-[#67E8F9] text-[#06222A] text-[12px] font-medium font-mono-tech hover:brightness-105"
          >
            Done
          </button>
        </div>
      </Card>
    </div>
  );
};
