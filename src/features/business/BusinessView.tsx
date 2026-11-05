import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Building2, Package, Shield, Truck } from 'lucide-react';
import { BusinessTier } from '../../types/game.types';

const TIERS: Array<{ id: BusinessTier; name: string; repReq: number; desc: string }> = [
  { id: 'street_trader', name: 'Street Trader', repReq: 0, desc: 'Operate curbside stalls and basic commodity haulage.' },
  { id: 'independent_merchant', name: 'Independent Merchant', repReq: 25, desc: 'Acquire dedicated depot storage and commercial license.' },
  { id: 'established_dealer', name: 'Established Dealer', repReq: 75, desc: 'Unlock wholesale bulk lots and broker arbitrage contracts.' },
  { id: 'market_operator', name: 'Market Operator', repReq: 150, desc: 'Establish multi-district warehouses and hire autonomous runners.' },
  { id: 'trade_magnate', name: 'Trade Magnate', repReq: 300, desc: 'Influence district tariffs and acquire real estate holdings.' },
  { id: 'market_power', name: 'Market Power', repReq: 600, desc: 'Dominate metropolitan trade routes and set pricing benchmarks.' },
];

export const BusinessView: React.FC = () => {
  const player = useGameStore((s) => s.state.player);
  const addToast = useUIStore((s) => s.addToast);

  const handleUpgradeStorage = () => {
    const cost = 800;
    if (player.balance < cost) {
      addToast('Insufficient funds for storage expansion.', 'error');
      return;
    }

    useGameStore.setState((state) => ({
      state: {
        ...state.state,
        player: {
          ...state.state.player,
          balance: state.state.player.balance - cost,
          storageCapacity: state.state.player.storageCapacity + 25,
        },
      },
    }));

    addToast('Depot storage upgraded (+25 kg capacity).', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">Enterprise Progression & Assets</h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Commercial standing, property acquisitions, and operational scalability
          </p>
        </div>
      </div>

      {/* Upgrades Section */}
      <div className="bg-terminal-card p-5 rounded border border-terminal-border">
        <h2 className="text-sm font-semibold text-terminal-text mb-4">Operational Upgrades</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Storage Upgrade */}
          <div className="bg-terminal-surface p-4 rounded border border-terminal-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-terminal-text">Storage Bay Expansion</span>
                <Package className="w-4 h-4 text-terminal-gold" />
              </div>
              <p className="text-xs text-terminal-muted mt-1">
                Adds 25 kg of high-security pallet volume to your primary depot.
              </p>
            </div>
            <div className="pt-2 border-t border-terminal-border flex items-center justify-between">
              <span className="num-mono font-bold text-xs text-terminal-gold">$800.00</span>
              <button
                onClick={handleUpgradeStorage}
                className="px-3 py-1 bg-terminal-gold text-terminal-bg font-semibold rounded text-xs hover:bg-terminal-gold/90 transition-colors"
              >
                Expand (+25kg)
              </button>
            </div>
          </div>

          {/* Logistics Channel */}
          <div className="bg-terminal-surface p-4 rounded border border-terminal-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-terminal-text">Contracted Haulers</span>
                <Truck className="w-4 h-4 text-terminal-blue" />
              </div>
              <p className="text-xs text-terminal-muted mt-1">
                Reduces inter-district travel transit tariffs by 20%.
              </p>
            </div>
            <div className="pt-2 border-t border-terminal-border flex items-center justify-between">
              <span className="num-mono font-bold text-xs text-terminal-muted">$1,400.00</span>
              <button
                disabled
                className="px-3 py-1 bg-terminal-border text-terminal-muted font-semibold rounded text-xs cursor-not-allowed"
              >
                Tier 2 Required
              </button>
            </div>
          </div>

          {/* Security Detail */}
          <div className="bg-terminal-surface p-4 rounded border border-terminal-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-terminal-text">Escort Detail</span>
                <Shield className="w-4 h-4 text-terminal-green" />
              </div>
              <p className="text-xs text-terminal-muted mt-1">
                Mitigates cargo seizure and inspection probability in Ashmarket.
              </p>
            </div>
            <div className="pt-2 border-t border-terminal-border flex items-center justify-between">
              <span className="num-mono font-bold text-xs text-terminal-muted">$2,200.00</span>
              <button
                disabled
                className="px-3 py-1 bg-terminal-border text-terminal-muted font-semibold rounded text-xs cursor-not-allowed"
              >
                Tier 3 Required
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progression Tiers */}
      <div className="bg-terminal-card p-5 rounded border border-terminal-border">
        <h2 className="text-sm font-semibold text-terminal-text mb-4">Merchant Hierarchy Ladder</h2>
        <div className="space-y-3">
          {TIERS.map((tier, idx) => {
            const isCurrent = player.tier === tier.id;

            return (
              <div
                key={tier.id}
                className={`p-4 rounded border flex items-center justify-between gap-4 transition-colors ${
                  isCurrent
                    ? 'bg-terminal-surface border-terminal-gold'
                    : 'bg-terminal-card border-terminal-border opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-terminal-surface border border-terminal-border flex items-center justify-center font-mono text-xs font-bold text-terminal-gold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-terminal-text">{tier.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-terminal-gold text-terminal-bg font-bold">
                          Active Rank
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-terminal-muted mt-0.5">{tier.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono text-terminal-muted">Requirement</div>
                  <div className="num-mono font-bold text-xs text-terminal-gold">
                    {tier.repReq} REP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
