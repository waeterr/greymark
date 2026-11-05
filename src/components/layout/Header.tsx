import React from 'react';
import { Menu, Coins, MapPin, Clock, Weight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

export const Header: React.FC = () => {
  const player = useGameStore((s) => s.state.player);
  const time = useGameStore((s) => s.state.time);
  const district = useGameStore((s) => s.state.districts[player.currentDistrict]);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

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

      <div className="flex items-center gap-4 sm:gap-6">
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

        {/* Clock */}
        <div className="flex items-center gap-1.5 text-xs text-terminal-muted">
          <Clock className="w-3.5 h-3.5 text-terminal-blue" />
          <span className="num-mono font-medium text-terminal-text">
            D{time.day} {String(time.hour).padStart(2, '0')}:00
          </span>
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
