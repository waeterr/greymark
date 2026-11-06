import React from 'react';
import { Item, DistrictId } from '../../types/game.types';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { PriceChart } from '../../components/charts/PriceChart';
import { calculateDynamicPrice } from '../../game/economy/EconomicEngine';
import { X, ArrowRight, TrendingUp, TrendingDown, Layers, MapPin } from 'lucide-react';

interface MarketInspectorProps {
  item: Item;
  onClose: () => void;
}

export const MarketInspector: React.FC<MarketInspectorProps> = ({ item, onClose }) => {
  const districts = useGameStore((s) => s.state.districts);
  const activeEvents = useGameStore((s) => s.state.activeEvents);
  const selectItem = useUIStore((s) => s.selectItem);
  const setActiveView = useUIStore((s) => s.setActiveView);

  const history = item.priceHistory.length > 0 ? item.priceHistory : [item.currentPrice];
  const highest = Math.max(...history);
  const lowest = Math.min(...history);
  const average = history.reduce((a, b) => a + b, 0) / history.length;
  const priceDiff = item.currentPrice - item.basePrice;
  const pctDiff = ((priceDiff / item.basePrice) * 100).toFixed(1);

  // Compute estimated price across each district for arbitrage scouting
  const districtPrices = (Object.keys(districts) as DistrictId[]).map((dId) => {
    const dist = districts[dId];
    const estimatedPrice = calculateDynamicPrice(item, dist, activeEvents);
    return {
      district: dist,
      price: estimatedPrice,
    };
  });

  const cheapestDistrict = [...districtPrices].sort((a, b) => a.price - b.price)[0];
  const dearestDistrict = [...districtPrices].sort((a, b) => b.price - a.price)[0];

  const handleStartTrade = () => {
    selectItem(item.id);
    setActiveView('trading');
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-terminal-card border-l border-terminal-border shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-terminal-border flex items-start justify-between bg-terminal-surface/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-terminal-surface text-terminal-gold border border-terminal-gold/30">
              {item.category.replace('_', ' ')}
            </span>
            <span
              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                item.legal
                  ? 'bg-terminal-green/10 text-terminal-green border-terminal-green/20'
                  : 'bg-terminal-red/10 text-terminal-red border-terminal-red/20'
              }`}
            >
              {item.legal ? 'Legal' : 'Contraband'}
            </span>
          </div>
          <h2 className="text-base font-bold text-terminal-text mt-1">{item.name}</h2>
          <p className="text-xs text-terminal-muted leading-relaxed mt-0.5">
            {item.description}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-terminal-muted hover:text-terminal-text hover:bg-terminal-surface"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body with Charts & Stats */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Main Price & Trend Header */}
        <div className="flex items-baseline justify-between bg-terminal-surface/60 p-3 rounded border border-terminal-border">
          <div>
            <div className="text-[10px] uppercase font-mono text-terminal-muted">Current Spot Price</div>
            <div className="num-mono text-2xl font-bold text-terminal-gold">
              ${item.currentPrice.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-terminal-muted">Variance from Base</div>
            <div
              className={`num-mono text-sm font-semibold flex items-center justify-end gap-1 ${
                priceDiff >= 0 ? 'text-terminal-green' : 'text-terminal-red'
              }`}
            >
              {priceDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {priceDiff >= 0 ? '+' : ''}
                {pctDiff}% (${Math.abs(priceDiff).toFixed(2)})
              </span>
            </div>
          </div>
        </div>

        {/* Historical Price Chart */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-terminal-muted mb-1.5">
            <span>Historical Telemetry</span>
            <span className="text-[10px] uppercase font-semibold text-terminal-text">
              Trend: {item.trend}
            </span>
          </div>
          <PriceChart data={history} basePrice={item.basePrice} height={130} />
        </div>

        {/* Key Analytical Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="bg-terminal-surface p-2.5 rounded border border-terminal-border">
            <span className="text-terminal-muted text-[10px] uppercase block">ATH Peak</span>
            <span className="num-mono font-bold text-terminal-text">${highest.toFixed(2)}</span>
          </div>
          <div className="bg-terminal-surface p-2.5 rounded border border-terminal-border">
            <span className="text-terminal-muted text-[10px] uppercase block">ATL Low</span>
            <span className="num-mono font-bold text-terminal-text">${lowest.toFixed(2)}</span>
          </div>
          <div className="bg-terminal-surface p-2.5 rounded border border-terminal-border">
            <span className="text-terminal-muted text-[10px] uppercase block">Avg Price</span>
            <span className="num-mono font-bold text-terminal-gold">${average.toFixed(2)}</span>
          </div>
        </div>

        {/* Supply vs Demand Gauge */}
        <div className="bg-terminal-surface p-3 rounded border border-terminal-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-terminal-muted flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-terminal-blue" />
              Market Inventory Flow
            </span>
            <span className="text-terminal-text font-bold">
              {item.supply} Supply / {item.demand} Demand
            </span>
          </div>
          <div className="w-full bg-terminal-bg h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-terminal-blue h-full"
              style={{
                width: `${(item.supply / (item.supply + item.demand || 1)) * 100}%`,
              }}
              title={`Supply: ${item.supply}`}
            />
            <div
              className="bg-terminal-gold h-full"
              style={{
                width: `${(item.demand / (item.supply + item.demand || 1)) * 100}%`,
              }}
              title={`Demand: ${item.demand}`}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-terminal-muted">
            <span className="text-terminal-blue">Supply ({item.supply})</span>
            <span className="text-terminal-gold">Demand ({item.demand})</span>
          </div>
        </div>

        {/* District Arbitrage Guide */}
        <div className="bg-terminal-surface p-3 rounded border border-terminal-border">
          <div className="text-[11px] font-mono uppercase text-terminal-gold font-semibold mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>District Arbitrage Intel</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            {cheapestDistrict && (
              <div className="flex justify-between p-1.5 rounded bg-terminal-bg/50 border border-terminal-border">
                <span className="text-terminal-muted">Cheapest (Buy):</span>
                <span className="text-terminal-green font-bold">
                  {cheapestDistrict.district?.name} (${cheapestDistrict.price.toFixed(2)})
                </span>
              </div>
            )}
            {dearestDistrict && (
              <div className="flex justify-between p-1.5 rounded bg-terminal-bg/50 border border-terminal-border">
                <span className="text-terminal-muted">Highest (Sell):</span>
                <span className="text-terminal-gold font-bold">
                  {dearestDistrict.district?.name} (${dearestDistrict.price.toFixed(2)})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-terminal-border bg-terminal-surface/30">
        <button
          onClick={handleStartTrade}
          className="w-full py-2.5 bg-terminal-gold text-terminal-bg font-bold rounded text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-terminal-gold/90 transition-colors shadow-md"
        >
          <span>Initiate Trade Order</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
