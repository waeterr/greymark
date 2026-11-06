import React from 'react';
import { Menu, Coins, MapPin, Clock, Weight, FastForward } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

export const Header: React.FC = () => {
  const player = useGameStore((s) => s.state.player);
  const time = useGameStore((s) => s.state.time);
  const district = useGameStore((s) => s.state.districts[player.currentDistrict]);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const addToast = useUIStore((s) => s.addToast);

  const handleAdvance = (hours: number) => {
    advanceTime(hours);
    addToast(`Advanced simulation +${hours}h. Market prices and supply shifted.`, 'info');
  };

  return (
    <header className="h-14 border-b border-terminal-border bg-terminal-card px-4 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded bg-terminal-surface text-terminal-muted hover:text-terminal-text"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-terminal-gold font-semibold">
            {player.tier.replace('_', ' ')}
          </span>
          <span className="text-terminal-muted hidden sm:inline">•</span>
          <span className="font-semibold text-sm hidden sm:inline text-terminal-text">
            {player.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* District */}
        <div className="flex items-center gap-1.5 text-xs text-terminal-muted">
          <MapPin className="w-3.5 h-3.5 text-terminal-gold" />
          <span className="text-terminal-text font-medium">{district ? district.name : player.currentDistrict}</span>
        </div>

        {/* Capacity */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-terminal-muted">
          <Weight className="w-3.5 h-3.5" />
          <span className="num-mono text-terminal-text">
            {player.currentWeight.toFixed(1)} / {player.storageCapacity}kg
          </span>
        </div>

        {/* Clock & Tick Controls */}
        <div className="flex items-center gap-1.5 bg-terminal-surface/60 border border-terminal-border px-2 py-1 rounded text-xs">
          <Clock className="w-3.5 h-3.5 text-terminal-blue" />
          <span className="num-mono font-medium text-terminal-text">
            D{time.day} {String(time.hour).padStart(2, '0')}:00
          </span>
          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-terminal-border">
            <button
              onClick={() => handleAdvance(1)}
              title="Advance 1 Hour"
              className="px-1.5 py-0.5 rounded bg-terminal-surface hover:bg-terminal-border text-terminal-gold font-mono text-[10px] font-bold"
            >
              +1h
            </button>
            <button
              onClick={() => handleAdvance(24)}
              title="Advance 1 Day (24 Hours)"
              className="px-1.5 py-0.5 rounded bg-terminal-surface hover:bg-terminal-border text-terminal-gold font-mono text-[10px] font-bold hidden sm:inline-flex items-center gap-0.5"
            >
              <FastForward className="w-2.5 h-2.5" />
              <span>+1d</span>
            </button>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="flex items-center gap-1.5 bg-terminal-surface px-2.5 py-1 rounded border border-terminal-border">
          <Coins className="w-3.5 h-3.5 text-terminal-gold" />
          <span className="num-mono text-xs font-semibold text-terminal-gold">
            ${player.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </header>
  );
};
