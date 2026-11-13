import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import {
  FileText,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { ContractStatus } from '../../types/game.types';

export const ContractsView: React.FC = () => {
  const state = useGameStore((s) => s.state);
  const player = state.player;
  const items = state.items;
  const districts = state.districts;
  const contracts = state.contracts;
  const activeNarrativeEvent = state.activeNarrativeEvent;

  const acceptContract = useGameStore((s) => s.acceptContract);
  const fulfillContract = useGameStore((s) => s.fulfillContract);
  const resolveNarrativeChoice = useGameStore((s) => s.resolveNarrativeChoice);
  const addToast = useUIStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<ContractStatus>('available');

  const contractList = Object.values(contracts).filter((c) => c.status === activeTab);

  const handleAccept = (contractId: string, title: string) => {
    const res = acceptContract(contractId);
    if (res.success) {
      addToast(`Accepted contract order: ${title}`, 'success');
      setActiveTab('active');
    } else {
      addToast(res.reason || 'Failed to accept contract', 'error');
    }
  };

  const handleFulfill = (contractId: string, title: string) => {
    const res = fulfillContract(contractId);
    if (res.success) {
      addToast(`Fulfilled & delivered: ${title}`, 'success');
    } else {
      addToast(res.reason || 'Failed to fulfill contract', 'error');
    }
  };

  const handleChoice = (index: number) => {
    const res = resolveNarrativeChoice(index);
    if (res.success) {
      addToast('Situation resolved.', 'info');
    } else {
      addToast(res.reason || 'Error resolving situation', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Narrative Event Incident Card */}
      {activeNarrativeEvent && (
        <div className="bg-terminal-card border-2 border-terminal-gold p-5 rounded space-y-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 text-terminal-gold">
            <Sparkles className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold uppercase tracking-wide">
              Priority Narrative Encounter: {activeNarrativeEvent.title}
            </h2>
          </div>
          <p className="text-xs text-terminal-text leading-relaxed">
            {activeNarrativeEvent.description}
          </p>

          <div className="space-y-2 pt-2 border-t border-terminal-border/80">
            <span className="text-[10px] font-mono uppercase text-terminal-muted block">
              Directives / Available Responses
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {activeNarrativeEvent.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(idx)}
                  className="p-3 rounded border border-terminal-border bg-terminal-surface hover:border-terminal-gold text-left text-xs font-mono transition-colors flex flex-col justify-between"
                >
                  <span className="text-terminal-text font-semibold">{choice.text}</span>
                  <span className="text-[10px] text-terminal-muted mt-2">
                    {choice.outcomeDescription}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">Commercial Contracts Board</h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Requisitions, time-sensitive delivery orders, and high-risk smuggling bounties
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-terminal-surface p-1 rounded border border-terminal-border text-xs font-mono">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'available'
                ? 'bg-terminal-gold text-terminal-bg font-bold'
                : 'text-terminal-muted hover:text-terminal-text'
            }`}
          >
            Available ({Object.values(contracts).filter((c) => c.status === 'available').length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'active'
                ? 'bg-terminal-gold text-terminal-bg font-bold'
                : 'text-terminal-muted hover:text-terminal-text'
            }`}
          >
            Pledged Active ({Object.values(contracts).filter((c) => c.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'completed'
                ? 'bg-terminal-gold text-terminal-bg font-bold'
                : 'text-terminal-muted hover:text-terminal-text'
            }`}
          >
            Archive ({Object.values(contracts).filter((c) => c.status === 'completed' || c.status === 'failed').length})
          </button>
        </div>
      </div>

      {/* Contract Cards Grid */}
      {contractList.length === 0 ? (
        <div className="bg-terminal-card p-8 rounded border border-terminal-border text-center text-xs font-mono text-terminal-muted">
          No contracts currently in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contractList.map((contract) => {
            const item = items[contract.targetItemId];
            const slot = player.inventory.find((s) => s.itemId === contract.targetItemId);
            const ownedQty = slot ? slot.quantity : 0;
            const hasEnough = ownedQty >= contract.targetQuantity;
            const inTargetDistrict =
              !contract.targetDistrictId || player.currentDistrict === contract.targetDistrictId;
            const targetDistrict = contract.targetDistrictId
              ? districts[contract.targetDistrictId]
              : null;

            return (
              <div
                key={contract.id}
                className={`p-5 rounded border flex flex-col justify-between space-y-4 transition-all ${
                  contract.isContraband
                    ? 'bg-terminal-card border-terminal-red/50'
                    : 'bg-terminal-card border-terminal-border'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border font-bold ${
                          contract.isContraband
                            ? 'bg-terminal-red/10 border-terminal-red text-terminal-red'
                            : 'bg-terminal-surface border-terminal-border text-terminal-gold'
                        }`}
                      >
                        {contract.type} {contract.isContraband && '• CONTRABAND'}
                      </span>
                      <h3 className="text-sm font-bold text-terminal-text mt-1.5">
                        {contract.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-terminal-muted shrink-0">
                      <Clock className="w-3.5 h-3.5 text-terminal-gold" />
                      <span>
                        Day {contract.deadlineDay}, {contract.deadlineHour}:00
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-terminal-muted mt-1 font-mono">
                    Issuer: <span className="text-terminal-text font-medium">{contract.issuer}</span>
                    {contract.issuerFaction && ` (${contract.issuerFaction.toUpperCase()})`}
                  </div>

                  <p className="text-xs text-terminal-muted mt-2 leading-relaxed">
                    {contract.description}
                  </p>

                  {/* Requirements & Payout */}
                  <div className="bg-terminal-surface p-3 rounded border border-terminal-border mt-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-terminal-muted">Required:</span>
                      <span
                        className={`font-bold ${
                          hasEnough ? 'text-terminal-green' : 'text-terminal-text'
                        }`}
                      >
                        {contract.targetQuantity}x {item ? item.name : contract.targetItemId} (
                        {ownedQty} in cargo)
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-terminal-muted">Destination:</span>
                      <span className="text-terminal-blue font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {targetDistrict ? targetDistrict.name : contract.districtId}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-terminal-border/60">
                      <span className="text-terminal-muted">Contract Yield:</span>
                      <span className="text-terminal-green font-bold">
                        ${contract.rewardCash} (+{contract.rewardRep} REP)
                      </span>
                    </div>
                  </div>

                  {contract.isContraband && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-terminal-red mt-2">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>Subject to customs interdiction and cargo seizure.</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-terminal-border/60">
                  {contract.status === 'available' && (
                    <button
                      onClick={() => handleAccept(contract.id, contract.title)}
                      className="w-full py-2 bg-terminal-surface border border-terminal-border hover:border-terminal-gold text-terminal-gold font-bold text-xs font-mono rounded transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Requisition</span>
                    </button>
                  )}

                  {contract.status === 'active' && (
                    <button
                      onClick={() => handleFulfill(contract.id, contract.title)}
                      disabled={!hasEnough || !inTargetDistrict}
                      className={`w-full py-2 rounded text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5 ${
                        hasEnough && inTargetDistrict
                          ? 'bg-terminal-gold text-terminal-bg hover:bg-terminal-gold/90'
                          : 'bg-terminal-surface border border-terminal-border text-terminal-muted cursor-not-allowed opacity-60'
                      }`}
                    >
                      {!hasEnough ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-terminal-red" />
                          <span>Insufficient Stock ({ownedQty}/{contract.targetQuantity})</span>
                        </>
                      ) : !inTargetDistrict ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-terminal-blue" />
                          <span>Travel to {targetDistrict?.name || 'Destination'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Deliver & Complete Payout</span>
                        </>
                      )}
                    </button>
                  )}

                  {contract.status === 'completed' && (
                    <div className="text-center py-1 text-xs font-mono text-terminal-green font-bold">
                      Order Completed & Payout Logged
                    </div>
                  )}

                  {contract.status === 'failed' && (
                    <div className="text-center py-1 text-xs font-mono text-terminal-red font-bold">
                      Deadline Expired — Reputation Defaulted
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
