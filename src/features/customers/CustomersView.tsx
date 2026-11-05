import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Users, ArrowRight, Wallet, ShoppingBag } from 'lucide-react';

const ARCHETYPES = [
  {
    type: 'Budget Buyers',
    desc: 'High price sensitivity; seeks standard consumer staples and cheap synthetic rations.',
    marginTolerance: 'Low',
    priority: 'Cost',
  },
  {
    type: 'Industrial Brokers',
    desc: 'Procures bulk hardware, copper, and servo parts for factory lines in Iron District.',
    marginTolerance: 'Medium',
    priority: 'Volume',
  },
  {
    type: 'Crown Collectors',
    desc: 'Elite buyers pursuing antique chronometers and restricted luxury extracts.',
    marginTolerance: 'High',
    priority: 'Rarity',
  },
  {
    type: 'Underground Syndicate',
    desc: 'Off-grid merchants purchasing unregistered tech and contraband components.',
    marginTolerance: 'Very High',
    priority: 'Discretion',
  },
];

export const CustomersView: React.FC = () => {
  const npcs = useGameStore((s) => s.state.npcs);
  const districts = useGameStore((s) => s.state.districts);
  const setActiveView = useUIStore((s) => s.setActiveView);

  const dealers = Object.values(npcs).filter(
    (npc) => npc.role === 'dealer' || npc.role === 'collector'
  );

  return (
    <div className="space-y-6">
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">Customer Demand Demographics</h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Buyer archetypes and commercial demand profiles across city sectors
          </p>
        </div>
      </div>

      {/* Customer Archetypes Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ARCHETYPES.map((arch) => (
          <div
            key={arch.type}
            className="bg-terminal-card p-4 rounded border border-terminal-border flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-terminal-gold">{arch.type}</span>
                <ShoppingBag className="w-3.5 h-3.5 text-terminal-muted" />
              </div>
              <p className="text-xs text-terminal-muted leading-relaxed">{arch.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-terminal-border flex justify-between text-[11px] font-mono">
              <span className="text-terminal-muted">Margin Tol:</span>
              <span className="text-terminal-text font-medium">{arch.marginTolerance}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Verified Dealers / Direct Buyers */}
      <div className="bg-terminal-card p-5 rounded border border-terminal-border">
        <h2 className="text-sm font-semibold text-terminal-text mb-4">
          Verified Commercial Buyers & Liquidators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dealers.map((dealer) => {
            const district = districts[dealer.districtId];
            return (
              <div
                key={dealer.id}
                className="bg-terminal-surface p-4 rounded border border-terminal-border flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-terminal-text">{dealer.name}</div>
                  <div className="text-xs text-terminal-muted mt-0.5">
                    {district?.name ?? dealer.districtId} • {dealer.role.toUpperCase()}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                    <span className="text-terminal-muted flex items-center gap-1">
                      <Wallet className="w-3 h-3" />
                      ${dealer.wealth.toLocaleString('en-US')}
                    </span>
                    <span className="text-terminal-green">Trust {dealer.trust}%</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('trading')}
                  className="px-3 py-1.5 bg-terminal-gold text-terminal-bg rounded text-xs font-semibold hover:bg-terminal-gold/90 flex items-center gap-1 transition-colors"
                >
                  <span>Sell Goods</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
