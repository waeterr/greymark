import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Truck, MapPin, Shield, ArrowRight } from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const npcs = useGameStore((s) => s.state.npcs);
  const items = useGameStore((s) => s.state.items);
  const districts = useGameStore((s) => s.state.districts);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const selectItem = useUIStore((s) => s.selectItem);

  const suppliers = Object.values(npcs).filter(
    (npc) => npc.role === 'supplier' || npc.inventory.length > 0
  );

  return (
    <div className="space-y-6">
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">Supplier Network Directory</h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Verified wholesale contacts and distribution pipelines across Veyra
          </p>
        </div>
        <div className="text-xs font-mono text-terminal-muted">
          Active Suppliers: <span className="text-terminal-gold font-bold">{suppliers.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((supplier) => {
          const district = districts[supplier.districtId];
          return (
            <div
              key={supplier.id}
              className="bg-terminal-card p-5 rounded border border-terminal-border flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-terminal-text">{supplier.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-terminal-muted mt-1">
                      <MapPin className="w-3.5 h-3.5 text-terminal-gold" />
                      <span>{district?.name ?? supplier.districtId}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-terminal-surface text-terminal-blue border border-terminal-border">
                    {supplier.personality}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                  <div className="bg-terminal-surface p-2 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px]">Trust Factor</span>
                    <div className="text-terminal-green font-bold flex items-center gap-1 mt-0.5">
                      <Shield className="w-3 h-3" />
                      <span>{supplier.trust}%</span>
                    </div>
                  </div>
                  <div className="bg-terminal-surface p-2 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px]">Capital Base</span>
                    <div className="text-terminal-gold font-bold mt-0.5">
                      ${supplier.wealth.toLocaleString('en-US')}
                    </div>
                  </div>
                </div>

                {/* Stock on Offer */}
                <div className="mt-4">
                  <div className="text-[11px] font-mono text-terminal-muted uppercase mb-2">
                    Available Inventory
                  </div>
                  <div className="space-y-1.5">
                    {supplier.inventory.map((inv) => {
                      const item = items[inv.itemId];
                      return (
                        <div
                          key={inv.itemId}
                          className="flex items-center justify-between p-2 rounded bg-terminal-surface/40 border border-terminal-border text-xs"
                        >
                          <div>
                            <span className="font-medium text-terminal-text">
                              {item ? item.name : inv.itemId}
                            </span>
                            <span className="text-terminal-muted ml-2 font-mono">
                              x{inv.quantity}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="num-mono font-semibold text-terminal-gold">
                              ${inv.price.toFixed(2)}
                            </span>
                            <button
                              onClick={() => {
                                selectItem(inv.itemId);
                                setActiveView('trading');
                              }}
                              className="px-2 py-0.5 rounded bg-terminal-surface text-terminal-gold hover:bg-terminal-gold hover:text-terminal-bg text-[11px] font-medium transition-colors"
                            >
                              Buy
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const firstItem = supplier.inventory[0];
                  if (firstItem) selectItem(firstItem.itemId);
                  setActiveView('trading');
                }}
                className="w-full py-2 bg-terminal-surface border border-terminal-border rounded text-xs font-semibold text-terminal-text hover:text-terminal-gold hover:border-terminal-gold/50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Initiate Negotiation Deck</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
