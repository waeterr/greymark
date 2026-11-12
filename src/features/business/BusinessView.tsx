import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { BusinessTier } from '../../types/game.types';
import {
  calculatePlayerNetWorth,
  checkTierEligibility,
  SKILL_TREE,
  TIER_REQUIREMENTS,
  getActivePerks,
  calculatePassiveIncome,
} from '../../game/progression/PlayerProgression';

const TIERS: Array<{ id: BusinessTier; name: string; desc: string }> = [
  { id: 'street_trader', name: 'Street Trader', desc: 'Operate curbside stalls and basic commodity haulage.' },
  { id: 'independent_merchant', name: 'Independent Merchant', desc: 'Acquire dedicated depot storage and commercial license.' },
  { id: 'established_dealer', name: 'Established Dealer', desc: 'Unlock wholesale bulk lots and broker arbitrage contracts.' },
  { id: 'market_operator', name: 'Market Operator', desc: 'Establish multi-district warehouses and hire autonomous runners.' },
  { id: 'trade_magnate', name: 'Trade Magnate', desc: 'Influence district tariffs and acquire real estate holdings.' },
  { id: 'market_power', name: 'Market Power', desc: 'Dominate metropolitan trade routes and set pricing benchmarks.' },
];

export const BusinessView: React.FC = () => {
  const state = useGameStore((s) => s.state);
  const player = state.player;
  const districts = state.districts;
  const purchaseProperty = useGameStore((s) => s.purchaseProperty);
  const unlockPlayerSkill = useGameStore((s) => s.unlockPlayerSkill);
  const promotePlayerTier = useGameStore((s) => s.promotePlayerTier);
  const addToast = useUIStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<'holdings' | 'skills' | 'ladder'>('holdings');

  const netWorth = calculatePlayerNetWorth(state);
  const eligibleNextTier = checkTierEligibility(player.tier, player.reputation, netWorth);
  const activePerks = getActivePerks(player.unlockedSkills);
  const hourlyIncome = calculatePassiveIncome(player.properties, 1);

  const handleAcquire = (propertyId: string, name: string) => {
    const res = purchaseProperty(propertyId);
    if (res.success) {
      addToast(`Acquired commercial deed: ${name}`, 'success');
    } else {
      addToast(res.reason || 'Failed to acquire property', 'error');
    }
  };

  const handleUnlockSkill = (skillId: string, name: string) => {
    const res = unlockPlayerSkill(skillId);
    if (res.success) {
      addToast(`Specialized: ${name}`, 'success');
    } else {
      addToast(res.reason || 'Failed to unlock skill', 'error');
    }
  };

  const handlePromote = () => {
    const res = promotePlayerTier();
    if (res.success) {
      addToast('Ascended to next Merchant Tier! New routes and privileges unlocked.', 'success');
    } else {
      addToast(res.reason || 'Promotion criteria not yet satisfied', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">Enterprise Progression & Assets</h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Commercial real estate, operational skill specialization, and merchant hierarchy standing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="bg-terminal-surface px-3 py-2 rounded border border-terminal-border">
            <span className="text-[10px] text-terminal-muted uppercase block">Estimated Net Worth</span>
            <span className="num-mono font-bold text-terminal-gold text-sm">
              ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-terminal-surface px-3 py-2 rounded border border-terminal-border">
            <span className="text-[10px] text-terminal-muted uppercase block">Passive Revenue</span>
            <span className="num-mono font-bold text-terminal-green text-sm">
              +${hourlyIncome.toFixed(2)} / hr
            </span>
          </div>

          <div className="bg-terminal-surface px-3 py-2 rounded border border-terminal-border">
            <span className="text-[10px] text-terminal-muted uppercase block">Specialization Points</span>
            <span className="num-mono font-bold text-terminal-blue text-sm">
              {player.skillPoints} SP
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-terminal-card p-1 rounded border border-terminal-border max-w-md">
        <button
          onClick={() => setActiveTab('holdings')}
          className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'holdings'
              ? 'bg-terminal-gold text-terminal-bg'
              : 'text-terminal-muted hover:text-terminal-text'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Real Estate ({player.properties.filter((p) => p.purchased).length})</span>
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'skills'
              ? 'bg-terminal-gold text-terminal-bg'
              : 'text-terminal-muted hover:text-terminal-text'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skills ({player.unlockedSkills.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ladder')}
          className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'ladder'
              ? 'bg-terminal-gold text-terminal-bg'
              : 'text-terminal-muted hover:text-terminal-text'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Hierarchy</span>
        </button>
      </div>

      {/* Tab 1: Real Estate Holdings */}
      {activeTab === 'holdings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {player.properties.map((prop) => {
              const district = districts[prop.districtId];

              return (
                <div
                  key={prop.id}
                  className={`p-4 rounded border flex flex-col justify-between space-y-4 transition-all ${
                    prop.purchased
                      ? 'bg-terminal-surface/90 border-terminal-gold shadow-sm'
                      : 'bg-terminal-card border-terminal-border'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-terminal-surface text-terminal-muted border border-terminal-border">
                          {prop.type.replace('_', ' ')}
                        </span>
                        <h3 className="font-bold text-sm text-terminal-text mt-1">{prop.name}</h3>
                      </div>
                      {prop.purchased ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-terminal-green/20 text-terminal-green border border-terminal-green/40">
                          ACQUIRED
                        </span>
                      ) : (
                        <span className="num-mono font-bold text-xs text-terminal-gold">
                          ${prop.cost.toLocaleString('en-US')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-terminal-muted leading-relaxed">
                      {prop.description}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-terminal-muted">
                      <MapPin className="w-3.5 h-3.5 text-terminal-blue" />
                      <span>{district ? district.name : prop.districtId}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-terminal-border/60 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-terminal-surface p-2 rounded border border-terminal-border">
                        <span className="text-terminal-muted text-[10px] uppercase block">Yield</span>
                        <span className="text-terminal-green font-bold">
                          +${prop.incomePerHour}/hr
                        </span>
                      </div>
                      <div className="bg-terminal-surface p-2 rounded border border-terminal-border">
                        <span className="text-terminal-muted text-[10px] uppercase block">Capacity</span>
                        <span className="text-terminal-text font-bold">
                          +{prop.capacityBonus} kg
                        </span>
                      </div>
                    </div>

                    {!prop.purchased ? (
                      <button
                        onClick={() => handleAcquire(prop.id, prop.name)}
                        disabled={player.balance < prop.cost}
                        className={`w-full py-2 rounded text-xs font-bold font-mono transition-colors ${
                          player.balance >= prop.cost
                            ? 'bg-terminal-gold text-terminal-bg hover:bg-terminal-gold/90'
                            : 'bg-terminal-surface text-terminal-muted border border-terminal-border cursor-not-allowed opacity-60'
                        }`}
                      >
                        {player.balance >= prop.cost ? 'Acquire Commercial Deed' : 'Insufficient Capital'}
                      </button>
                    ) : (
                      <div className="text-center py-1.5 text-[11px] font-mono text-terminal-muted flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green" />
                        <span>Generating passive dividend</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Skill Specialization */}
      {activeTab === 'skills' && (
        <div className="space-y-5">
          {/* Active Perks Banner */}
          <div className="bg-terminal-card p-4 rounded border border-terminal-border">
            <h3 className="text-xs font-mono uppercase text-terminal-muted font-bold mb-2">
              Consolidated Enterprise Perks
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-terminal-surface p-2.5 rounded border border-terminal-border">
                <span className="text-terminal-muted text-[10px] block">Negotiation Margin</span>
                <span className="text-terminal-gold font-bold">
                  +{Math.round(activePerks.negotiationBonus * 100)}%
                </span>
              </div>
              <div className="bg-terminal-surface p-2.5 rounded border border-terminal-border">
                <span className="text-terminal-muted text-[10px] block">Expanded Payload</span>
                <span className="text-terminal-text font-bold">
                  +{activePerks.capacityBonus} kg
                </span>
              </div>
              <div className="bg-terminal-surface p-2.5 rounded border border-terminal-border">
                <span className="text-terminal-muted text-[10px] block">Transit Tariff Relief</span>
                <span className="text-terminal-green font-bold">
                  -{Math.round(activePerks.transportCostReduction * 100)}%
                </span>
              </div>
              <div className="bg-terminal-surface p-2.5 rounded border border-terminal-border">
                <span className="text-terminal-muted text-[10px] block">Reputation Gain</span>
                <span className="text-terminal-blue font-bold">
                  x{activePerks.reputationMultiplier.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Skill Tree List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SKILL_TREE.map((skill) => {
              const isUnlocked = player.unlockedSkills.includes(skill.id);
              const canAfford = player.skillPoints >= skill.cost;

              return (
                <div
                  key={skill.id}
                  className={`p-4 rounded border flex flex-col justify-between space-y-3 transition-colors ${
                    isUnlocked
                      ? 'bg-terminal-surface/90 border-terminal-green/60'
                      : 'bg-terminal-card border-terminal-border'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-terminal-surface text-terminal-muted border border-terminal-border">
                          {skill.category} • Tier {skill.tier}
                        </span>
                        <h4 className="font-bold text-sm text-terminal-text mt-1">{skill.name}</h4>
                      </div>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-terminal-green font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="num-mono font-bold text-xs text-terminal-blue">
                          {skill.cost} SP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-terminal-muted mt-2 leading-relaxed">
                      {skill.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-terminal-border/60">
                    {!isUnlocked ? (
                      <button
                        onClick={() => handleUnlockSkill(skill.id, skill.name)}
                        disabled={!canAfford}
                        className={`w-full py-1.5 rounded text-xs font-bold font-mono transition-colors ${
                          canAfford
                            ? 'bg-terminal-blue text-white hover:bg-terminal-blue/90'
                            : 'bg-terminal-surface text-terminal-muted border border-terminal-border cursor-not-allowed opacity-50'
                        }`}
                      >
                        {canAfford ? `Unlock Specialization (${skill.cost} SP)` : `Requires ${skill.cost} SP`}
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-terminal-muted">
                        Active operational benefit
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Merchant Hierarchy Ladder */}
      {activeTab === 'ladder' && (
        <div className="space-y-4">
          {eligibleNextTier && (
            <div className="bg-terminal-green/10 border border-terminal-green/30 p-4 rounded flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-terminal-green uppercase tracking-wide">
                  Tier Promotion Eligibility Reached
                </div>
                <div className="text-xs text-terminal-text mt-0.5">
                  Your standing and capital qualify you to ascend to{' '}
                  <span className="font-bold capitalize">{eligibleNextTier.replace('_', ' ')}</span>.
                </div>
              </div>
              <button
                onClick={handlePromote}
                className="px-4 py-2 bg-terminal-green text-terminal-bg font-bold rounded text-xs hover:bg-terminal-green/90 transition-colors"
              >
                Claim Promotion
              </button>
            </div>
          )}

          <div className="bg-terminal-card p-5 rounded border border-terminal-border space-y-3">
            <h2 className="text-sm font-semibold text-terminal-text mb-4">
              Merchant Hierarchy Ladder
            </h2>
            <div className="space-y-3">
              {TIERS.map((tier, idx) => {
                const isCurrent = player.tier === tier.id;
                const req = TIER_REQUIREMENTS[tier.id];
                const meetsRep = player.reputation >= req.minRep;
                const meetsNetWorth = netWorth >= req.minNetWorth;

                return (
                  <div
                    key={tier.id}
                    className={`p-4 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isCurrent
                        ? 'bg-terminal-surface border-terminal-gold shadow-sm'
                        : 'bg-terminal-card border-terminal-border opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-terminal-surface border border-terminal-border flex items-center justify-center font-mono text-xs font-bold text-terminal-gold shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-terminal-text">{tier.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-terminal-gold text-terminal-bg font-bold">
                              Active Rank
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-terminal-muted mt-0.5">{tier.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-terminal-border/60">
                      <div>
                        <div className="text-[10px] font-mono text-terminal-muted uppercase">
                          Requirements
                        </div>
                        <div className="text-xs font-mono">
                          <span className={meetsRep ? 'text-terminal-green' : 'text-terminal-muted'}>
                            {req.minRep} REP
                          </span>{' '}
                          •{' '}
                          <span className={meetsNetWorth ? 'text-terminal-green' : 'text-terminal-muted'}>
                            ${req.minNetWorth.toLocaleString('en-US')} NW
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
