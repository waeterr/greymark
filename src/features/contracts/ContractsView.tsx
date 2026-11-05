import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { FileText, CheckCircle2 } from 'lucide-react';

const CONTRACTS_SAMPLE = [
  {
    id: 'ct_iron_rations',
    title: 'Foundry Provision Supply',
    issuer: 'Iron Smelter Guild',
    district: 'Iron District',
    description: 'Deliver 10x Synthetic Grain Rations to feed night-shift foundry crews.',
    targetItem: 'synthetic_grain',
    targetQty: 10,
    rewardCash: 450,
    rewardRep: 8,
    deadlineDay: 3,
  },
  {
    id: 'ct_filtration_urgent',
    title: 'Emergency Water Filter Replacements',
    issuer: 'Municipal Utility Directorate',
    district: 'Old Quarter',
    description: 'Supply 6x Aqueous Filter Cartridges to resolve pipeline sediment alarm.',
    targetItem: 'filter_cartridge',
    targetQty: 6,
    rewardCash: 620,
    rewardRep: 12,
    deadlineDay: 2,
  },
  {
    id: 'ct_servo_salvage',
    title: 'Precision Actuator Requisition',
    issuer: 'Merek Sterling',
    district: 'Iron District',
    description: 'Acquire 3x Precision Servo Motors for assembly line overhaul.',
    targetItem: 'servo_motor',
    targetQty: 3,
    rewardCash: 950,
    rewardRep: 15,
    deadlineDay: 5,
  },
];

export const ContractsView: React.FC = () => {
  const player = useGameStore((s) => s.state.player);
  const addToast = useUIStore((s) => s.addToast);

  const handleFulfill = (_title: string, targetItem: string, targetQty: number, rewardCash: number, rewardRep: number) => {
    const slot = player.inventory.find((s) => s.itemId === targetItem);
    if (!slot || slot.quantity < targetQty) {
      addToast(`Shortfall: You need ${targetQty} units in storage to fulfill.`, 'error');
      return;
    }

    useGameStore.setState((state) => {
      const inv = [...state.state.player.inventory];
      const idx = inv.findIndex((s) => s.itemId === targetItem);
      const curr = inv[idx]!;
      if (curr.quantity === targetQty) {
        inv.splice(idx, 1);
      } else {
        inv[idx] = { ...curr, quantity: curr.quantity - targetQty };
      }

      return {
        state: {
          ...state.state,
          player: {
            ...state.state.player,
            balance: state.state.player.balance + rewardCash,
            reputation: state.state.player.reputation + rewardRep,
            inventory: inv,
          },
        },
      };
    });

    addToast(`Contract fulfilled! Received $${rewardCash} +${rewardRep} REP`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">Commercial Contracts Board</h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Requisitions, time-sensitive delivery orders, and corporate procurement bounties
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CONTRACTS_SAMPLE.map((contract) => {
          const slot = player.inventory.find((s) => s.itemId === contract.targetItem);
          const hasEnough = (slot?.quantity ?? 0) >= contract.targetQty;

          return (
            <div
              key={contract.id}
              className="bg-terminal-card p-5 rounded border border-terminal-border flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h2 className="text-sm font-bold text-terminal-text">{contract.title}</h2>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-terminal-surface text-terminal-gold border border-terminal-gold/30">
                    Day {contract.deadlineDay}
                  </span>
                </div>
                <div className="text-[11px] text-terminal-muted mt-1">
                  Issued by: <span className="text-terminal-text font-medium">{contract.issuer}</span> • {contract.district}
                </div>
                <p className="text-xs text-terminal-muted mt-3 leading-relaxed">
                  {contract.description}
                </p>

                <div className="bg-terminal-surface p-3 rounded border border-terminal-border mt-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-terminal-muted">Required:</span>
                    <span className="text-terminal-text font-bold">
                      {contract.targetQty}x ({slot?.quantity ?? 0} in stock)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-muted">Payout:</span>
                    <span className="text-terminal-green font-bold">
                      ${contract.rewardCash} (+{contract.rewardRep} REP)
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  handleFulfill(
                    contract.title,
                    contract.targetItem,
                    contract.targetQty,
                    contract.rewardCash,
                    contract.rewardRep
                  )
                }
                className={`w-full py-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  hasEnough
                    ? 'bg-terminal-gold text-terminal-bg hover:bg-terminal-gold/90 font-bold'
                    : 'bg-terminal-surface border border-terminal-border text-terminal-muted hover:text-terminal-text'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{hasEnough ? 'Fulfill Contract Order' : 'Procure Commodities First'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
