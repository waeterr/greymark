import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Share2, Radio, MessageSquare } from 'lucide-react';

const CONTACTS_SAMPLE = [
  {
    id: 'ct_informant_ash',
    name: 'Ghost (Wire Tapper)',
    role: 'Informant',
    location: 'Ashmarket',
    intel: 'Rumor: Customs raid scheduled at Harborline Container Dock 4 in 48 hours.',
    cost: 150,
  },
  {
    id: 'ct_broker_neon',
    name: 'Soren Vance (Cargo Broker)',
    role: 'Broker',
    location: 'Neon Row',
    intel: 'Wholesale clearance lot: 20x Quantum Logic Boards arriving next cycle.',
    cost: 300,
  },
];

export const NetworkView: React.FC = () => {
  const player = useGameStore((s) => s.state.player);
  const addToast = useUIStore((s) => s.addToast);

  const handlePurchaseIntel = (cost: number, tip: string) => {
    if (player.balance < cost) {
      addToast('Insufficient funds to pay informant fee.', 'error');
      return;
    }

    useGameStore.setState((state) => ({
      state: {
        ...state.state,
        player: {
          ...state.state.player,
          balance: state.state.player.balance - cost,
        },
      },
    }));

    addToast(`Intel decoded: "${tip}"`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="bg-terminal-card p-5 rounded border border-terminal-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-terminal-gold" />
            <h1 className="text-lg font-bold text-terminal-text">Underground Network & Informants</h1>
          </div>
          <p className="text-xs text-terminal-muted mt-1">
            Encrypted signal taps, field runners, and commercial reconnaissance assets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CONTACTS_SAMPLE.map((contact) => (
          <div
            key={contact.id}
            className="bg-terminal-card p-5 rounded border border-terminal-border flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-terminal-text">{contact.name}</h2>
                  <div className="text-xs text-terminal-muted mt-0.5 font-mono">
                    {contact.role.toUpperCase()} • Sector: {contact.location}
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-terminal-green animate-pulse" />
              </div>

              <div className="bg-terminal-surface p-3.5 rounded border border-terminal-border mt-4 text-xs font-mono">
                <div className="text-terminal-muted text-[10px] uppercase flex items-center gap-1.5 mb-1.5">
                  <Radio className="w-3.5 h-3.5 text-terminal-gold" />
                  <span>Encrypted Channel Intercept</span>
                </div>
                <div className="text-terminal-text italic">"{contact.intel}"</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="num-mono text-xs text-terminal-gold font-bold">
                Fee: ${contact.cost.toFixed(2)}
              </span>
              <button
                onClick={() => handlePurchaseIntel(contact.cost, contact.intel)}
                className="px-3 py-1.5 bg-terminal-surface border border-terminal-border hover:border-terminal-gold text-terminal-text hover:text-terminal-gold rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Decrypt Full Wire</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
