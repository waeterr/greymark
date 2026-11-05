import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { MapPin, ArrowRight, Lock } from 'lucide-react';
import { DistrictId } from '../../types/game.types';

export const DistrictsView: React.FC = () => {
  const districts = useGameStore((s) => s.state.districts);
  const player = useGameStore((s) => s.state.player);
  const travelToDistrict = useGameStore((s) => s.travelToDistrict);
  const addToast = useUIStore((s) => s.addToast);

  const handleTravel = (districtId: DistrictId) => {
    const success = travelToDistrict(districtId);
    const target = districts[districtId];
    if (success) {
      addToast(`Transit complete. Arrived in ${target.name}. Tariff deducted.`, 'success');
    } else {
      addToast('Cannot transit: insufficient funds or sector locked.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">City Districts & Sectors</h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Veyra metropolitan trade zones, transport logistics, and tariff schedules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(Object.values(districts) as Array<(typeof districts)[DistrictId]>).map((dist) => {
          const isCurrent = player.currentDistrict === dist.id;
          return (
            <div
              key={dist.id}
              className={`p-5 rounded border flex flex-col justify-between space-y-4 transition-all ${
                isCurrent
                  ? 'bg-terminal-surface/90 border-terminal-gold shadow-lg shadow-terminal-gold/5'
                  : 'bg-terminal-card border-terminal-border'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-terminal-text">{dist.name}</h2>
                      {isCurrent && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-terminal-gold text-terminal-bg font-bold">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-terminal-muted mt-1">{dist.tagline}</div>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      dist.riskLevel === 'low'
                        ? 'bg-terminal-green/10 text-terminal-green border-terminal-green/30'
                        : dist.riskLevel === 'moderate'
                        ? 'bg-terminal-gold/10 text-terminal-gold border-terminal-gold/30'
                        : 'bg-terminal-red/10 text-terminal-red border-terminal-red/30'
                    }`}
                  >
                    {dist.riskLevel} Risk
                  </span>
                </div>

                <p className="text-xs text-terminal-muted mt-3 leading-relaxed">
                  {dist.description}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] font-mono">
                  <div className="bg-terminal-bg p-2 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px]">Supply</span>
                    <div className="text-terminal-text font-bold mt-0.5">
                      {(dist.supplyModifier * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-terminal-bg p-2 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px]">Demand</span>
                    <div className="text-terminal-text font-bold mt-0.5">
                      {(dist.demandModifier * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-terminal-bg p-2 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px]">Transit Fee</span>
                    <div className="text-terminal-gold font-bold mt-0.5">
                      ${dist.transportCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {isCurrent ? (
                  <div className="w-full py-2 text-center text-xs font-mono text-terminal-gold bg-terminal-gold/10 rounded border border-terminal-gold/20 font-semibold">
                    Stationed at District Hub
                  </div>
                ) : dist.unlocked ? (
                  <button
                    onClick={() => handleTravel(dist.id)}
                    className="w-full py-2 bg-terminal-surface border border-terminal-border rounded text-xs font-semibold text-terminal-text hover:text-terminal-gold hover:border-terminal-gold/50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Board Transport (${dist.transportCost})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-xs font-mono text-terminal-muted bg-terminal-bg rounded border border-terminal-border flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sector Access Restricted</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
