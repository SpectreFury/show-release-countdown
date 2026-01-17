"use client";
import { useState } from "react";

type Props = {
  onFilterChange: (selectedPlatform: string | null) => void;
};

const MAJOR_PLATFORMS = [
  'Netflix',
  'Amazon Prime Video',
  'HBO',
  'Hulu',
  'Apple TV+',
  'Disney+',
  'Peacock',
];

export default function PlatformFilter({ onFilterChange }: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Handle platform selection
  const handleSelectPlatform = (platform: string | null) => {
    setSelectedPlatform(platform);
    onFilterChange(platform);
    setIsOpen(false);
  };

  return (
    <div className="mb-8 relative">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:border-purple-500/60 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {selectedPlatform ? selectedPlatform : 'Select Platform'}
            {selectedPlatform && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-500 text-xs font-bold">
                Active
              </span>
            )}
          </button>
        </div>

        {selectedPlatform && (
          <button
            onClick={() => handleSelectPlatform(null)}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 z-50 bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/20 p-4 min-w-64 backdrop-blur-md">
          <button
            onClick={() => handleSelectPlatform(null)}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-purple-500/10 cursor-pointer transition-colors text-sm font-medium text-white mb-2"
          >
            Show All Platforms
          </button>
          
          <div className="border-t border-slate-700/50 my-2" />
          
          <div className="space-y-1">
            {MAJOR_PLATFORMS.map((platform) => (
              <button
                key={platform}
                onClick={() => handleSelectPlatform(platform)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  selectedPlatform === platform
                    ? 'bg-purple-600/30 text-white border border-purple-500/50'
                    : 'text-slate-300 hover:bg-purple-500/10 hover:text-white'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
