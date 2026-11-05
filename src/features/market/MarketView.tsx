import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { ItemCategory } from '../../types/game.types';
import { Search, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

const CATEGORIES: Array<{ id: ItemCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All Commodities' },
  { id: 'consumer_goods', label: 'Consumer' },
  { id: 'raw_materials', label: 'Raw Materials' },
  { id: 'industrial_components', label: 'Industrial' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'luxury_goods', label: 'Luxury' },
];

export const MarketView: React.FC = () => {
  const items = useGameStore((s) => s.state.items);
  const selectItem = useUIStore((s) => s.selectItem);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');

  const itemList = Object.values(items).filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleTradeItem = (itemId: string) => {
    selectItem(itemId);
    setActiveView('trading');
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-terminal-card p-4 rounded border border-terminal-border flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-terminal-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search commodities, parts, contraband..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-terminal-surface border border-terminal-border pl-9 pr-3 py-1.5 text-xs text-terminal-text rounded focus:outline-none focus:border-terminal-gold"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-terminal-gold text-terminal-bg font-semibold'
                  : 'bg-terminal-surface text-terminal-muted hover:text-terminal-text border border-terminal-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commodity Table */}
      <div className="bg-terminal-card rounded border border-terminal-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-terminal-border bg-terminal-surface/40 text-terminal-muted font-mono uppercase">
                <th className="p-3">Commodity</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Market Price</th>
                <th className="p-3 text-right">Base</th>
                <th className="p-3 text-center">Trend</th>
                <th className="p-3 text-right">Supply / Demand</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border">
              {itemList.map((item) => {
                const priceDiff = item.currentPrice - item.basePrice;
                const pct = ((priceDiff / item.basePrice) * 100).toFixed(1);

                return (
                  <tr key={item.id} className="hover:bg-terminal-surface/20 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-terminal-text">{item.name}</div>
                      <div className="text-[11px] text-terminal-muted">{item.weight} kg • Vol {item.volume}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-terminal-muted capitalize">
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="p-3 text-right num-mono font-semibold text-terminal-gold">
                      ${item.currentPrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-right num-mono text-terminal-muted">
                      ${item.basePrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1 font-mono text-[11px]">
                        {priceDiff > 0 ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 text-terminal-green" />
                            <span className="text-terminal-green">+{pct}%</span>
                          </>
                        ) : priceDiff < 0 ? (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 text-terminal-red" />
                            <span className="text-terminal-red">{pct}%</span>
                          </>
                        ) : (
                          <>
                            <Minus className="w-3.5 h-3.5 text-terminal-muted" />
                            <span className="text-terminal-muted">0.0%</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right num-mono text-terminal-text">
                      <span className="text-terminal-blue">{item.supply}</span> / <span className="text-terminal-gold">{item.demand}</span>
                    </td>
                    <td className="p-3 text-center">
                      {item.legal ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-terminal-green/10 text-terminal-green border border-terminal-green/20">
                          LEGAL
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-terminal-red/10 text-terminal-red border border-terminal-red/20">
                          CONTRABAND
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleTradeItem(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-terminal-surface border border-terminal-border rounded text-terminal-gold hover:bg-terminal-gold hover:text-terminal-bg transition-colors font-medium text-xs"
                      >
                        <span>Trade</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
