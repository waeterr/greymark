# GREYMARK

**Every Deal Has a Consequence.**

Single-player browser-based economic strategy game built with TypeScript, React, and Zustand.

## Tech Stack

- **TypeScript** (strict mode)
- **React 19** + **Vite**
- **Tailwind CSS** (dark industrial terminal theme)
- **Zustand** (state management)
- **LocalStorage** (save/load persistence)

## Features

- 12 fully functional view modules:
  - Dashboard (financial overview, recent transactions)
  - Market (commodity browser, price trends)
  - Trading (buy/sell terminal with validation)
  - Inventory (warehouse management, quick liquidation)
  - Suppliers (NPC supplier directory, stock listings)
  - Customers (buyer archetypes, commercial dealers)
  - Network (informants, encrypted intel)
  - Districts (6 city sectors, transport system)
  - Business (upgrades, merchant hierarchy tiers)
  - Contracts (time-sensitive delivery orders)
  - Factions (4 political syndicates, reputation)
  - Statistics (analytics dashboard, P/L tracking)

## Development

```bash
npm install
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
npm test          # Run self-check tests
```

## Game Loop

1. Start with $1,500 capital in Old Quarter
2. Buy low from suppliers (synthetic grain, filters, copper, servos, logic boards)
3. Monitor dynamic market prices (supply/demand/trends)
4. Sell high to dealers and collectors
5. Manage warehouse capacity (weight-based storage)
6. Travel between districts (transport tariffs apply)
7. Fulfill contracts for cash + reputation
8. Unlock new districts and business upgrades
9. Build faction standing for exclusive access

---

**Build a world worth trading in. Not just a dashboard worth looking at.**
