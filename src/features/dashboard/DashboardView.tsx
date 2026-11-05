import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import {
  TrendingUp,
  Package,
  ShieldAlert,
  ArrowRight,
  Coins,
  History,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const player = useGameStore((s) => s.state.player);
  const items = useGameStore((s) => s.state.items);
  const districts = useGameStore((s) => s.state.districts);
  const transactions = useGameStore((s) => s.state.transactions);
  const currentDistrict = districts[player.currentDistrict];
  const setActiveView = useUIStore((s) => s.setActiveView);
  const addToast = useUIStore((s) => s.addToast);

  // Calculate inventory valuation
  const inventoryValue = player.inventory.reduce((sum, slot) => {
    const item = items[slot.itemId];
    const unitVal = item ? item.currentPrice : slot.averageBuyPrice;
    return sum + unitVal * slot.quantity;
  }, 0);

  const netWorth = player.balance + inventoryValue - player.debt;

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-terminal-card p-5 rounded border border-terminal-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-terminal-text">Commercial Overview</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-terminal-surface text-terminal-gold border border-terminal-gold/30">
              Active Terminal
            </span>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            District: {currentDistrict?.name} • Station: Central Trading Registry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('market')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-terminal-gold text-terminal-bg rounded text-xs font-semibold hover:bg-terminal-gold/90 transition-colors"
          >
            <span>Scan Market</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              addToast('Logistics channels synced with local docks.', 'info');
            }}
            className="px-3 py-1.5 bg-terminal-surface border border-terminal-border text-terminal-muted hover:text-terminal-text rounded text-xs transition-colors"
          >
            Sync Feeds
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash Balance */}
        <div className="bg-terminal-card p-4 rounded border border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-xs mb-2">
            <span>Liquid Capital</span>
            <Coins className="w-4 h-4 text-terminal-gold" />
          </div>
          <div className="num-mono text-xl font-bold text-terminal-gold">
            ${player.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-terminal-muted mt-1">
            Debt: ${player.debt.toLocaleString('en-US')}
          </div>
        </div>

        {/* Net Worth */}
        <div className="bg-terminal-card p-4 rounded border border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-xs mb-2">
            <span>Net Asset Value</span>
            <TrendingUp className="w-4 h-4 text-terminal-green" />
          </div>
          <div className="num-mono text-xl font-bold text-terminal-green">
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-terminal-muted mt-1">
            Inventory: ${inventoryValue.toLocaleString('en-US')}
          </div>
        </div>

        {/* Storage */}
        <div className="bg-terminal-card p-4 rounded border border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-xs mb-2">
            <span>Warehouse Cargo</span>
            <Package className="w-4 h-4 text-terminal-blue" />
          </div>
          <div className="num-mono text-xl font-bold text-terminal-text">
            {player.currentWeight.toFixed(1)} / {player.storageCapacity} kg
          </div>
          <div className="w-full bg-terminal-surface h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-terminal-blue h-full"
              style={{
                width: `${Math.min(100, (player.currentWeight / player.storageCapacity) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Standing */}
        <div className="bg-terminal-card p-4 rounded border border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-xs mb-2">
            <span>Reputation Score</span>
            <ShieldAlert className="w-4 h-4 text-terminal-gold" />
          </div>
          <div className="num-mono text-xl font-bold text-terminal-text">
            {player.reputation} REP
          </div>
          <div className="text-[11px] text-terminal-muted mt-1 uppercase">
            Rank: {player.tier.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Split Cards: Recent Transactions & District Intel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-terminal-card p-5 rounded border border-terminal-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-terminal-gold" />
              <h2 className="text-sm font-semibold text-terminal-text">
                Recent Transaction Ledger
              </h2>
            </div>
            <button
              onClick={() => setActiveView('trading')}
              className="text-xs text-terminal-gold hover:underline"
            >
              Open Trading Deck
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-terminal-border text-terminal-muted font-mono uppercase">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-terminal-surface/30">
                    <td className="py-2.5 num-mono text-terminal-muted">
                      D{tx.day} {String(tx.hour).padStart(2, '0')}:00
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                          tx.type === 'buy'
                            ? 'bg-terminal-blue/20 text-terminal-blue'
                            : 'bg-terminal-green/20 text-terminal-green'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 font-medium text-terminal-text">
                      {tx.itemName}
                    </td>
                    <td className="py-2.5 text-right num-mono text-terminal-text">
                      {tx.quantity}
                    </td>
                    <td className="py-2.5 text-right num-mono text-terminal-muted">
                      ${tx.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right num-mono font-semibold text-terminal-text">
                      ${tx.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current District Card (1 col) */}
        <div className="bg-terminal-card p-5 rounded border border-terminal-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase text-terminal-gold font-semibold">
                District Telemetry
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-terminal-surface text-terminal-green border border-terminal-green/20">
                {currentDistrict?.riskLevel} Risk
              </span>
            </div>
            <h3 className="text-base font-bold text-terminal-text">
              {currentDistrict?.name}
            </h3>
            <p className="text-xs text-terminal-muted mt-2 leading-relaxed">
              {currentDistrict?.description}
            </p>

            <div className="mt-4 pt-4 border-t border-terminal-border space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-muted">Supply Index:</span>
                <span className="text-terminal-text">
                  {(currentDistrict?.supplyModifier ?? 1) * 100}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted">Demand Index:</span>
                <span className="text-terminal-text">
                  {(currentDistrict?.demandModifier ?? 1) * 100}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted">Transit Tariff:</span>
                <span className="text-terminal-text">
                  ${currentDistrict?.transportCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('districts')}
            className="w-full mt-6 py-2 bg-terminal-surface border border-terminal-border rounded text-xs font-semibold text-terminal-text hover:text-terminal-gold hover:border-terminal-gold/50 transition-colors"
          >
            Explore Districts
          </button>
        </div>
      </div>
    </div>
  );
};
