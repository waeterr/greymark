import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Shield, BarChart2 } from 'lucide-react';
import { FactionId } from '../../types/game.types';

export const FactionsView: React.FC = () => {
  const factions = useGameStore((s) => s.state.factions);

  return (
    <div className="space-y-6">
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">Political & Trade Factions</h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Powerful economic syndicates, regulatory bodies, and guild associations governing Veyra
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(Object.values(factions) as Array<(typeof factions)[FactionId]>).map((faction) => {
          return (
            <div
              key={faction.id}
              className="bg-terminal-card p-5 rounded border border-terminal-border flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h2 className="text-base font-bold text-terminal-text">{faction.name}</h2>
                  <div className="flex items-center gap-1 text-xs font-mono">
                    <span className="text-terminal-muted">Standing:</span>
                    <span
                      className={`font-bold ${
                        faction.reputation > 0
                          ? 'text-terminal-green'
                          : faction.reputation < 0
                          ? 'text-terminal-red'
                          : 'text-terminal-muted'
                      }`}
                    >
                      {faction.reputation > 0 ? `+${faction.reputation}` : faction.reputation} REP
                    </span>
                  </div>
                </div>

                <p className="text-xs text-terminal-muted mt-2 leading-relaxed">
                  {faction.description}
                </p>

                {/* Influence Meter */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-terminal-muted flex items-center gap-1">
                      <BarChart2 className="w-3.5 h-3.5 text-terminal-blue" />
                      Metropolitan Market Control
                    </span>
                    <span className="text-terminal-gold font-bold">{faction.influence}%</span>
                  </div>
                  <div className="w-full bg-terminal-surface h-2 rounded-full overflow-hidden border border-terminal-border">
                    <div
                      className="bg-terminal-gold h-full rounded-full transition-all duration-300"
                      style={{ width: `${faction.influence}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-terminal-surface p-3 rounded border border-terminal-border text-xs flex items-center justify-between">
                <span className="text-terminal-muted">Faction Privileges</span>
                <span className="font-mono text-terminal-text text-[11px]">
                  {faction.reputation >= 20 ? 'Wholesale Clearance' : 'Standard Citizen Tariff'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
