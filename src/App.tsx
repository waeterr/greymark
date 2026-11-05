import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/feedback/ToastContainer';
import { DashboardView } from './features/dashboard/DashboardView';
import { MarketView } from './features/market/MarketView';
import { TradingView } from './features/trading/TradingView';
import { InventoryView } from './features/inventory/InventoryView';
import { SuppliersView } from './features/suppliers/SuppliersView';
import { CustomersView } from './features/customers/CustomersView';
import { NetworkView } from './features/network/NetworkView';
import { DistrictsView } from './features/districts/DistrictsView';
import { BusinessView } from './features/business/BusinessView';
import { ContractsView } from './features/contracts/ContractsView';
import { FactionsView } from './features/factions/FactionsView';
import { StatisticsView } from './features/statistics/StatisticsView';
import { useUIStore } from './store/uiStore';

function App() {
  const activeView = useUIStore((s) => s.activeView);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'market':
        return <MarketView />;
      case 'trading':
        return <TradingView />;
      case 'inventory':
        return <InventoryView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'customers':
        return <CustomersView />;
      case 'network':
        return <NetworkView />;
      case 'districts':
        return <DistrictsView />;
      case 'business':
        return <BusinessView />;
      case 'contracts':
        return <ContractsView />;
      case 'factions':
        return <FactionsView />;
      case 'statistics':
        return <StatisticsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-terminal-bg text-terminal-text overflow-hidden select-none">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderView()}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
