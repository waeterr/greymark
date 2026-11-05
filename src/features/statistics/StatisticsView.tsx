import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { BarChart3, TrendingUp, History, Coins, Package } from 'lucide-react';

export const StatisticsView: React.FC = () => {
  const player = useGameStore((s) => s.state.player);
  const items = useGameStore((s) => s.state.items);
  const transactions = useGameStore((s) => s.state.transactions);
  const time = useGameStore((s) => s.state.time);

  const inventoryValue = player.inventory.reduce((sum, slot) => {
    const item = items[slot.itemId];
    return sum + (item ? item.currentPrice * slot.quantity : slot.averageBuyPrice * slot.quantity);
  }, 0);

  const netWorth = player.balance + inventoryValue - player.debt;

  const totalBought = transactions.filter((t) => t.type === 'buy').reduce((s, t) => s + t.totalPrice, 0);
  const totalSold = transactions.filter((t) => t.type === 'sell').reduce((s, t) => s + t.totalPrice, 0);
  const totalProfit = transactions
    .filter((t) => t.type === 'sell')
    .reduce((s, t) => s + (t.profit ?? 0), 0);

  const buysCount = transactions.filter((t) => t.type === 'buy').length;
  const sellsCount = transactions.filter((t) => t.type === 'sell').length;

  return (
    <div className="space-y-6">
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">
              Analytics Dashboard & Performance Metrics
            </h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Financial audit, transaction ledger summary, and operational KPIs
          </p>
        </div>
        <div className="text-xs font-mono text-terminal-muted">
          Cycle Day <span className="text-terminal-gold font-bold">{time.day}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-terminal-card p-4 rounded border border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-xs mb-2">
            <span>Net Asset Value</span>
            <TrendingUp className="w-4 h-4 text-terminal-green" />
          </div>
          <div className="num-mono text-2xl font-bold text-terminal-green">
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-terminal-card p-4 rounded border border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-xs mb-2">
            <span>Realized P/L</span>
            <Coins className="w-4 h-4 text-terminal-gold" />
          </div>
          <div
            className={`num-mono text-2xl font-bold ${
              totalProfit >= 0 ? 'text-terminal-green' : 'text-terminal-red'
            }`}
          >
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </div>
        </div>

        <div className="bg-terminal-card p-4 rounded border border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-xs mb-2">
            <span>Transaction Volume</span>
            <History className="w-4 h-4 text-terminal-blue" />
          </div>
          <div className="num-mono text-2xl font-bold text-terminal-text">
            {transactions.length}
          </div>
          <div className="text-[11px] text-terminal-muted mt-1">
            Buy: {buysCount} • Sell: {sellsCount}
          </div>
        </div>

        <div className="bg-terminal-card p-4 rounded border border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-xs mb-2">
            <span>Inventory Valuation</span>
            <Package className="w-4 h-4 text-terminal-gold" />
          </div>
          <div className="num-mono text-2xl font-bold text-terminal-gold">
            ${inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Financial Breakdown Table */}
      <div className="bg-terminal-card p-5 rounded border border-terminal-border">
        <h2 className="text-sm font-semibold text-terminal-text mb-4">
          Commercial Financial Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-mono uppercase text-terminal-muted mb-3">
              Acquisition Activity
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 bg-terminal-surface rounded border border-terminal-border">
                <span className="text-terminal-muted">Total Purchases:</span>
                <span className="text-terminal-red font-bold">
                  -${totalBought.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-terminal-surface rounded border border-terminal-border">
                <span className="text-terminal-muted">Buy Orders Executed:</span>
                <span className="text-terminal-text font-bold">{buysCount}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-terminal-muted mb-3">
              Liquidation Activity
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 bg-terminal-surface rounded border border-terminal-border">
                <span className="text-terminal-muted">Total Revenue:</span>
                <span className="text-terminal-green font-bold">
                  +${totalSold.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-terminal-surface rounded border border-terminal-border">
                <span className="text-terminal-muted">Sell Orders Executed:</span>
                <span className="text-terminal-text font-bold">{sellsCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-terminal-surface rounded border border-terminal-gold/30">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-terminal-text">
              Net Cumulative Profit/Loss:
            </span>
            <span
              className={`num-mono text-lg font-bold ${
                totalProfit >= 0 ? 'text-terminal-green' : 'text-terminal-red'
              }`}
            >
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Player Profile */}
      <div className="bg-terminal-card p-5 rounded border border-terminal-border">
        <h2 className="text-sm font-semibold text-terminal-text mb-4">Operator Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-terminal-surface p-3 rounded border border-terminal-border">
            <span className="text-terminal-muted text-[10px] uppercase block">Callsign</span>
            <div className="text-terminal-text font-bold mt-1">{player.name}</div>
          </div>
          <div className="bg-terminal-surface p-3 rounded border border-terminal-border">
            <span className="text-terminal-muted text-[10px] uppercase block">Rank Tier</span>
            <div className="text-terminal-gold font-bold mt-1 capitalize">
              {player.tier.replace('_', ' ')}
            </div>
          </div>
          <div className="bg-terminal-surface p-3 rounded border border-terminal-border">
            <span className="text-terminal-muted text-[10px] uppercase block">Reputation</span>
            <div className="text-terminal-text font-bold mt-1">{player.reputation} REP</div>
          </div>
          <div className="bg-terminal-surface p-3 rounded border border-terminal-border">
            <span className="text-terminal-muted text-[10px] uppercase block">Debt Balance</span>
            <div className="text-terminal-red font-bold mt-1">
              ${player.debt.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
