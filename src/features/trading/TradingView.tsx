import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Check, AlertCircle, ShoppingCart, DollarSign, Handshake } from 'lucide-react';
import { PriceChart } from '../../components/charts/PriceChart';
import { calculateNegotiationOutcome, NegotiationResult } from '../../game/npc/NegotiationEngine';

export const TradingView: React.FC = () => {
  const player = useGameStore((s) => s.state.player);
  const items = useGameStore((s) => s.state.items);
  const npcs = useGameStore((s) => s.state.npcs);
  const buyItem = useGameStore((s) => s.buyItem);
  const sellItem = useGameStore((s) => s.sellItem);

  const selectedItemId = useUIStore((s) => s.selectedItemId);
  const selectItem = useUIStore((s) => s.selectItem);
  const addToast = useUIStore((s) => s.addToast);

  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [activeItemId, setActiveItemId] = useState<string>(
    selectedItemId || Object.keys(items)[0] || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [negotiationResult, setNegotiationResult] = useState<NegotiationResult | null>(null);

  const currentItem = items[activeItemId];
  const localNpcs = Object.values(npcs).filter(
    (npc) => npc.districtId === player.currentDistrict
  );
  const defaultNpc = localNpcs[0] || {
    id: 'npc_local_broker',
    name: 'District Broker',
    districtId: player.currentDistrict,
    role: 'broker' as const,
    personality: 'cautious' as const,
    wealth: 5000,
    trust: 10,
    reputation: 20,
    inventory: [],
  };

  // Find inventory stock for current item
  const inventorySlot = player.inventory.find((slot) => slot.itemId === activeItemId);
  const ownedQty = inventorySlot ? inventorySlot.quantity : 0;

  // Pricing
  const spotPrice = currentItem ? currentItem.currentPrice : 0;
  const effectiveUnitPrice = isNegotiating && negotiationResult?.outcome === 'accepted' 
    ? negotiationResult.finalPrice 
    : isNegotiating && negotiationResult?.outcome === 'counter_offer'
    ? negotiationResult.counterOfferPrice || spotPrice
    : spotPrice;

  const totalPrice = effectiveUnitPrice * quantity;
  const requiredWeight = currentItem ? currentItem.weight * quantity : 0;
  const remainingCapacity = player.storageCapacity - player.currentWeight;

  const canAfford = mode === 'buy' ? player.balance >= totalPrice : true;
  const hasCapacity = mode === 'buy' ? remainingCapacity >= requiredWeight : true;
  const hasStock = mode === 'sell' ? ownedQty >= quantity : true;
  const isValid = quantity > 0 && (mode === 'buy' ? canAfford && hasCapacity : hasStock);

  // Initialize custom bid when toggling negotiation
  const handleToggleNegotiation = () => {
    if (!isNegotiating) {
      // Default initial bid offer: 10% discount for buy, 10% markup for sell
      const initialOffer = mode === 'buy' ? spotPrice * 0.9 : spotPrice * 1.1;
      setBidPrice(Math.round(initialOffer * 100) / 100);
      setNegotiationResult(null);
    }
    setIsNegotiating(!isNegotiating);
  };

  const handleProposeBid = () => {
    if (!currentItem) return;

    const res = calculateNegotiationOutcome({
      type: mode,
      item: currentItem,
      quantity,
      offeredPrice: bidPrice,
      npc: defaultNpc,
      playerReputation: player.reputation,
    });

    setNegotiationResult(res);

    if (res.outcome === 'accepted') {
      addToast(res.reason, 'success');
    } else if (res.outcome === 'counter_offer') {
      addToast(res.reason, 'warning');
    } else {
      addToast(res.reason, 'error');
    }
  };

  const handleExecuteTrade = () => {
    if (!currentItem) return;

    if (mode === 'buy') {
      const res = buyItem({
        itemId: currentItem.id,
        quantity,
        unitPrice: effectiveUnitPrice,
        counterpartyId: defaultNpc.id,
        counterpartyName: defaultNpc.name,
        quality: currentItem.quality,
      });

      if (res.success) {
        addToast(`Acquired ${quantity}x ${currentItem.name} at $${effectiveUnitPrice.toFixed(2)}`, 'success');
        setIsNegotiating(false);
        setNegotiationResult(null);
      } else {
        addToast(res.reason || 'Transaction rejected', 'error');
      }
    } else {
      const res = sellItem({
        itemId: currentItem.id,
        quantity,
        unitPrice: effectiveUnitPrice,
        counterpartyId: defaultNpc.id,
        counterpartyName: defaultNpc.name,
      });

      if (res.success) {
        addToast(`Liquidated ${quantity}x ${currentItem.name} at $${effectiveUnitPrice.toFixed(2)}`, 'success');
        setIsNegotiating(false);
        setNegotiationResult(null);
      } else {
        addToast(res.reason || 'Transaction rejected', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex bg-terminal-card p-1 rounded border border-terminal-border max-w-sm">
        <button
          onClick={() => {
            setMode('buy');
            setQuantity(1);
            setIsNegotiating(false);
            setNegotiationResult(null);
          }}
          className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            mode === 'buy'
              ? 'bg-terminal-blue text-terminal-bg'
              : 'text-terminal-muted hover:text-terminal-text'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Procure Goods (Buy)</span>
        </button>
        <button
          onClick={() => {
            setMode('sell');
            setQuantity(1);
            setIsNegotiating(false);
            setNegotiationResult(null);
          }}
          className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            mode === 'sell'
              ? 'bg-terminal-green text-terminal-bg'
              : 'text-terminal-muted hover:text-terminal-text'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Liquidate (Sell)</span>
        </button>
      </div>

      {/* Main Trading Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Picker (1 col) */}
        <div className="bg-terminal-card p-4 rounded border border-terminal-border">
          <h2 className="text-xs font-mono uppercase text-terminal-muted mb-3 font-semibold">
            Select Commodity
          </h2>
          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {Object.values(items).map((item) => {
              const isSelected = item.id === activeItemId;
              const slot = player.inventory.find((s) => s.itemId === item.id);
              const qtyInStock = slot ? slot.quantity : 0;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItemId(item.id);
                    selectItem(item.id);
                    setQuantity(1);
                    setIsNegotiating(false);
                    setNegotiationResult(null);
                  }}
                  className={`w-full text-left p-2.5 rounded border text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-terminal-surface border-terminal-gold text-terminal-text'
                      : 'border-terminal-border text-terminal-muted hover:border-terminal-muted hover:text-terminal-text'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-terminal-text">{item.name}</div>
                    <div className="text-[11px] text-terminal-muted capitalize">
                      {item.category.replace('_', ' ')} • {item.weight}kg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="num-mono font-semibold text-terminal-gold">
                      ${item.currentPrice.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-terminal-muted num-mono">
                      Owned: {qtyInStock}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction Terminal Deck (2 cols) */}
        {currentItem && (
          <div className="lg:col-span-2 bg-terminal-card p-5 rounded border border-terminal-border flex flex-col justify-between">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-terminal-border gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-terminal-surface text-terminal-gold border border-terminal-gold/30">
                    {currentItem.category.replace('_', ' ')}
                  </span>
                  <h1 className="text-lg font-bold text-terminal-text mt-1">
                    {currentItem.name}
                  </h1>
                  <p className="text-xs text-terminal-muted">{currentItem.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-terminal-muted">
                    {isNegotiating ? 'Effective Agreed Rate' : 'Quoted Spot Price'}
                  </div>
                  <div className="num-mono text-2xl font-bold text-terminal-gold">
                    ${effectiveUnitPrice.toFixed(2)}
                  </div>
                  {isNegotiating && (
                    <div className="text-[10px] font-mono text-terminal-muted">
                      Original: ${spotPrice.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Telemetry Chart */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-terminal-muted mb-1">
                  <span>Price History & Trend ({currentItem.trend.toUpperCase()})</span>
                  <span>Supply: {currentItem.supply} • Demand: {currentItem.demand}</span>
                </div>
                <PriceChart
                  data={currentItem.priceHistory}
                  basePrice={currentItem.basePrice}
                  height={90}
                />
              </div>

              {/* Negotiation Proposal Box */}
              <div className="bg-terminal-surface/40 p-3.5 rounded border border-terminal-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Handshake className="w-4 h-4 text-terminal-gold" />
                    <span className="text-xs font-semibold text-terminal-text">
                      Price Haggling & Negotiation
                    </span>
                  </div>
                  <button
                    onClick={handleToggleNegotiation}
                    className="text-xs font-mono text-terminal-gold hover:underline"
                  >
                    {isNegotiating ? 'Reset to Spot Price' : 'Propose Terms'}
                  </button>
                </div>

                {isNegotiating && (
                  <div className="space-y-2 pt-2 border-t border-terminal-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-terminal-muted">Offer Unit Price:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={bidPrice}
                        onChange={(e) => setBidPrice(parseFloat(e.target.value) || 0)}
                        className="w-28 bg-terminal-bg border border-terminal-border px-2 py-1 text-xs num-mono text-terminal-gold font-bold rounded focus:outline-none focus:border-terminal-gold"
                      />
                      <button
                        onClick={handleProposeBid}
                        className="px-3 py-1 bg-terminal-gold text-terminal-bg font-bold rounded text-xs hover:bg-terminal-gold/90 transition-colors"
                      >
                        Submit Proposal
                      </button>
                    </div>

                    {negotiationResult && (
                      <div
                        className={`p-2.5 rounded border text-xs font-mono flex items-start gap-2 ${
                          negotiationResult.outcome === 'accepted'
                            ? 'bg-terminal-green/10 border-terminal-green/30 text-terminal-green'
                            : negotiationResult.outcome === 'counter_offer'
                            ? 'bg-terminal-gold/10 border-terminal-gold/30 text-terminal-gold'
                            : 'bg-terminal-red/10 border-terminal-red/30 text-terminal-red'
                        }`}
                      >
                        <span className="font-bold uppercase shrink-0">
                          [{negotiationResult.outcome.replace('_', ' ')}]:
                        </span>
                        <span>{negotiationResult.reason}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="bg-terminal-surface/60 p-4 rounded border border-terminal-border space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-terminal-text">Transaction Volume</span>
                  <span className="text-terminal-muted num-mono">
                    {mode === 'buy'
                      ? `Max Affordable: ${Math.floor(player.balance / (effectiveUnitPrice || 1))}`
                      : `In Warehouse: ${ownedQty}`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded bg-terminal-surface border border-terminal-border text-terminal-text font-bold text-sm hover:border-terminal-gold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-terminal-bg border border-terminal-border px-3 py-2 text-center num-mono font-bold text-terminal-text rounded text-sm focus:outline-none focus:border-terminal-gold"
                  />
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded bg-terminal-surface border border-terminal-border text-terminal-text font-bold text-sm hover:border-terminal-gold"
                  >
                    +
                  </button>
                  <button
                    onClick={() => {
                      if (mode === 'buy') {
                        const maxAffordable = Math.floor(player.balance / effectiveUnitPrice);
                        const maxWeight = Math.floor(remainingCapacity / currentItem.weight);
                        setQuantity(Math.max(1, Math.min(maxAffordable, maxWeight)));
                      } else {
                        setQuantity(Math.max(1, ownedQty));
                      }
                    }}
                    className="px-3 py-2 bg-terminal-surface border border-terminal-border text-terminal-gold text-xs font-mono font-semibold rounded hover:bg-terminal-gold hover:text-terminal-bg"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Financial & Weight Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-terminal-surface p-3 rounded border border-terminal-border">
                  <div className="text-terminal-muted text-[10px] uppercase">Total Cost</div>
                  <div className="text-terminal-text font-bold num-mono text-sm mt-1">
                    ${totalPrice.toFixed(2)}
                  </div>
                </div>

                <div className="bg-terminal-surface p-3 rounded border border-terminal-border">
                  <div className="text-terminal-muted text-[10px] uppercase">Cargo Weight</div>
                  <div className="text-terminal-text font-bold num-mono text-sm mt-1">
                    {requiredWeight.toFixed(1)} kg
                  </div>
                </div>

                <div className="bg-terminal-surface p-3 rounded border border-terminal-border col-span-2 sm:col-span-1">
                  <div className="text-terminal-muted text-[10px] uppercase">Counterparty</div>
                  <div className="text-terminal-gold font-bold text-sm mt-1 truncate">
                    {defaultNpc.name}
                  </div>
                </div>
              </div>

              {/* Warnings / Status messages */}
              {!canAfford && mode === 'buy' && (
                <div className="flex items-center gap-2 text-xs text-terminal-red bg-terminal-red/10 p-2.5 rounded border border-terminal-red/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Insufficient liquid capital for this transaction.</span>
                </div>
              )}
              {!hasCapacity && mode === 'buy' && (
                <div className="flex items-center gap-2 text-xs text-terminal-red bg-terminal-red/10 p-2.5 rounded border border-terminal-red/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Exceeds available warehouse weight capacity.</span>
                </div>
              )}
              {!hasStock && mode === 'sell' && (
                <div className="flex items-center gap-2 text-xs text-terminal-red bg-terminal-red/10 p-2.5 rounded border border-terminal-red/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>You do not possess the required stock in storage.</span>
                </div>
              )}
            </div>

            {/* Execute Button */}
            <div className="pt-6 border-t border-terminal-border mt-6">
              <button
                disabled={!isValid || (isNegotiating && negotiationResult?.outcome === 'rejected')}
                onClick={handleExecuteTrade}
                className={`w-full py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isValid && (!isNegotiating || negotiationResult?.outcome !== 'rejected')
                    ? mode === 'buy'
                      ? 'bg-terminal-blue text-white hover:bg-terminal-blue/90 shadow-md'
                      : 'bg-terminal-green text-terminal-bg hover:bg-terminal-green/90 shadow-md'
                    : 'bg-terminal-surface text-terminal-muted border border-terminal-border cursor-not-allowed opacity-50'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  Confirm {mode === 'buy' ? 'Acquisition' : 'Liquidation'} (
                  ${totalPrice.toFixed(2)})
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
