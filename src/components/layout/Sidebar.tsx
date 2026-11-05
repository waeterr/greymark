import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  Package,
  Truck,
  Users,
  Share2,
  MapPin,
  Building2,
  FileText,
  Shield,
  BarChart3,
  X,
} from 'lucide-react';
import { NavView } from '../../types/game.types';
import { useUIStore } from '../../store/uiStore';

interface NavItem {
  id: NavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'market', label: 'Market', icon: TrendingUp },
  { id: 'trading', label: 'Trading', icon: ArrowLeftRight },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'network', label: 'Network', icon: Share2 },
  { id: 'districts', label: 'Districts', icon: MapPin },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'contracts', label: 'Contracts', icon: FileText },
  { id: 'factions', label: 'Factions', icon: Shield },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
];

export const Sidebar: React.FC = () => {
  const activeView = useUIStore((s) => s.activeView);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const handleSelect = (id: NavView) => {
    setActiveView(id);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-terminal-card border-r border-terminal-border flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-14 border-b border-terminal-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-terminal-gold rounded-xs"></div>
            <span className="font-mono text-base font-bold tracking-widest text-terminal-text">
              GREYMARK
            </span>
            <span className="text-[10px] uppercase font-mono px-1 py-0.5 bg-terminal-surface text-terminal-muted rounded border border-terminal-border">
              v0.1
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-terminal-muted hover:text-terminal-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-terminal-muted px-3 py-1 font-semibold">
            Operations
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-terminal-surface text-terminal-gold border border-terminal-gold/30'
                    : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-surface/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-terminal-gold' : 'text-terminal-muted'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* District & Seed Footer */}
        <div className="p-3 border-t border-terminal-border text-[11px] text-terminal-muted font-mono flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Terminal</span>
            <span className="text-terminal-text">VEYRA-NET</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="text-terminal-green">ONLINE</span>
          </div>
        </div>
      </aside>
    </>
  );
};
