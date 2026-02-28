# KudoBit

**Digital Value, Instantly Rewarded**

KudoBit is a Web3 commerce app where creators can sell digital products and users can buy them with wallet-based payments.

## What You Can Do

- Connect wallet and sign in
- Browse and buy digital products
- Track purchases and rewards
- Manage creator profile and products
- Use community and governance features

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Hono
- Blockchain: Solidity + Hardhat
- Storage/Auth: JWT, wallet auth, IPFS-ready integrations

## Quick Start (5 Minutes)

### 1. Install dependencies

```bash
bun install
cd backend && bun install && cd ..
```

### 2. Start backend

```bash
cd backend
bun run start
```

Backend runs on `http://localhost:5000`.

### 3. Start frontend

Open a new terminal in project root:

```bash
bun run dev
```

Frontend runs on `http://localhost:5173`.

## Common Commands

```bash
# Frontend
bun run dev
bun run build
bun run preview
bun run type-check

# Backend
cd backend
bun run start
bun run dev
bun run test
```

## Environment

### Backend (`backend/.env`)

```env
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Project Structure

- `src/` frontend app
- `backend/` API server
- `blockchain/` smart contracts
- `docs/` architecture, deployment, setup guides

## Documentation

- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Deployment](docs/deployment/DEPLOYMENT.md)
- [Backend Integration](docs/setup/BACKEND-INTEGRATION-COMPLETE.md)
- [Setup Notes](docs/setup/SETUP-COMPLETE.md)
- [Backend API README](backend/README.md)

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Open a pull request with a clear description

## License

MIT
