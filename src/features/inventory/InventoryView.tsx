import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Package, ArrowRight, DollarSign } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const player = useGameStore((s) => s.state.player);
  const items = useGameStore((s) => s.state.items);
  const sellItem = useGameStore((s) => s.sellItem);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const selectItem = useUIStore((s) => s.selectItem);
  const addToast = useUIStore((s) => s.addToast);

  const totalInventoryValue = player.inventory.reduce((sum, slot) => {
    const item = items[slot.itemId];
    return sum + (item ? item.currentPrice * slot.quantity : slot.averageBuyPrice * slot.quantity);
  }, 0);

  const handleQuickSell = (itemId: string, quantity: number, unitPrice: number) => {
    const res = sellItem({
      itemId,
      quantity,
      unitPrice,
      counterpartyId: 'npc_local_broker',
      counterpartyName: 'Local Market Broker',
    });
    if (res.success) {
      addToast(`Liquidated ${quantity} units at $${unitPrice.toFixed(2)}`, 'success');
    } else {
      addToast(res.reason || 'Failed to sell item', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Warehouse Header */}
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">Warehouse Storage Deck</h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Station: Veyra Central Depot • Vault Storage Compartment #4
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-terminal-muted">Storage Valuation</div>
            <div className="num-mono text-lg font-bold text-terminal-gold">
              ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-terminal-muted">Capacity Load</div>
            <div className="num-mono text-lg font-bold text-terminal-text">
              {player.currentWeight.toFixed(1)} / {player.storageCapacity} kg
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Item List */}
      <div className="bg-terminal-card rounded border border-terminal-border overflow-hidden">
        {player.inventory.length === 0 ? (
          <div className="p-8 text-center text-terminal-muted space-y-3">
            <Package className="w-10 h-10 mx-auto text-terminal-muted/50" />
            <div className="text-sm font-medium">Warehouse storage is currently empty</div>
            <p className="text-xs max-w-sm mx-auto">
              Procure goods from local district suppliers or the open market to begin trading.
            </p>
            <button
              onClick={() => setActiveView('market')}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-terminal-gold text-terminal-bg font-semibold rounded text-xs mt-2"
            >
              <span>Scan Market Commodities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-terminal-border bg-terminal-surface/40 text-terminal-muted font-mono uppercase">
                  <th className="p-3">Commodity</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Unit Weight</th>
                  <th className="p-3 text-right">Avg Purchase</th>
                  <th className="p-3 text-right">Market Price</th>
                  <th className="p-3 text-right">Unrealized P/L</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border">
                {player.inventory.map((slot) => {
                  const item = items[slot.itemId];
                  const currentPrice = item ? item.currentPrice : slot.averageBuyPrice;
                  const unitDiff = currentPrice - slot.averageBuyPrice;
                  const totalDiff = unitDiff * slot.quantity;
                  const diffPct = ((unitDiff / (slot.averageBuyPrice || 1)) * 100).toFixed(1);

                  return (
                    <tr key={`${slot.itemId}_${slot.quality}`} className="hover:bg-terminal-surface/20">
                      <td className="p-3">
                        <div className="font-semibold text-terminal-text">
                          {item ? item.name : slot.itemId}
                        </div>
                        <div className="text-[11px] text-terminal-muted capitalize font-mono">
                          Quality: {slot.quality}
                        </div>
                      </td>
                      <td className="p-3 text-right num-mono font-bold text-terminal-text">
                        {slot.quantity}
                      </td>
                      <td className="p-3 text-right num-mono text-terminal-muted">
                        {((item?.weight ?? 1) * slot.quantity).toFixed(1)} kg
                      </td>
                      <td className="p-3 text-right num-mono text-terminal-muted">
                        ${slot.averageBuyPrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-right num-mono font-semibold text-terminal-gold">
                        ${currentPrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-right num-mono font-medium">
                        <span className={totalDiff >= 0 ? 'text-terminal-green' : 'text-terminal-red'}>
                          {totalDiff >= 0 ? '+' : ''}${totalDiff.toFixed(2)} ({diffPct}%)
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              selectItem(slot.itemId);
                              setActiveView('trading');
                            }}
                            className="px-2 py-1 bg-terminal-surface border border-terminal-border rounded text-terminal-muted hover:text-terminal-text text-xs"
                          >
                            Trade
                          </button>
                          <button
                            onClick={() => handleQuickSell(slot.itemId, slot.quantity, currentPrice)}
                            className="px-2 py-1 bg-terminal-green/10 border border-terminal-green/30 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg rounded text-xs font-semibold flex items-center gap-1"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Sell All</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
