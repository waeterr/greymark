import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Shield, BarChart2, CheckCircle2, Lock } from 'lucide-react';
import { FactionId } from '../../types/game.types';
import { checkFactionPrivileges } from '../../game/factions/FactionEngine';

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
          const privileges = checkFactionPrivileges(faction.id, faction.reputation);

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

              {/* Faction Privileges & Unlocks */}
              <div className="space-y-2 pt-2 border-t border-terminal-border/60">
                <div className="text-[10px] font-mono uppercase text-terminal-muted font-semibold">
                  Privilege Clearance Tiers
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div
                    className={`p-2 rounded border flex items-center gap-1.5 ${
                      privileges.canAccessExclusiveContracts
                        ? 'bg-terminal-green/10 border-terminal-green/30 text-terminal-green'
                        : 'bg-terminal-surface border-terminal-border text-terminal-muted'
                    }`}
                  >
                    {privileges.canAccessExclusiveContracts ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="text-[11px]">Exclusive Bounties (40+ REP)</span>
                  </div>

                  <div
                    className={`p-2 rounded border flex items-center gap-1.5 ${
                      privileges.priceDiscountModifier < 1.0
                        ? 'bg-terminal-green/10 border-terminal-green/30 text-terminal-green'
                        : 'bg-terminal-surface border-terminal-border text-terminal-muted'
                    }`}
                  >
                    {privileges.priceDiscountModifier < 1.0 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="text-[11px]">5% Wholesale Rebate (50+ REP)</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
