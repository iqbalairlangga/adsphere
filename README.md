# AdSphere — Enterprise Advertising Platform

<div align="center">

[![CI](https://github.com/adsphere/adsphere/actions/workflows/ci.yml/badge.svg)](https://github.com/adsphere/adsphere/actions)
[![CD](https://github.com/adsphere/adsphere/actions/workflows/cd.yml/badge.svg)](https://github.com/adsphere/adsphere/actions)
[![Coverage](https://img.shields.io/codecov/c/github/adsphere/adsphere)](https://codecov.io/gh/adsphere/adsphere)
[![Version](https://img.shields.io/github/v/release/adsphere/adsphere)](https://github.com/adsphere/adsphere/releases)
[![License](https://img.shields.io/github/license/adsphere/adsphere)](LICENSE)

</div>

**AdSphere** is a production-grade, enterprise digital advertising platform connecting advertisers, publishers, and administrators in a unified ecosystem. Built with modern TypeScript stack, clean architecture, and security-first design.

## Architecture

```
adsphere/
├── backend/          # NestJS API server
├── frontend/         # Next.js web application
├── packages/         # Shared libraries
│   ├── shared/       # Common types, utils, validators
│   ├── eslint-config # Shared ESLint config
│   └── tsconfig      # Shared TypeScript config
├── docker/           # Container configuration
├── database/         # Migrations and seeds
├── infra/            # Infrastructure as Code
├── scripts/          # Automation scripts
├── tests/            # E2E and integration tests
└── docs/             # Documentation
```

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + Shadcn UI
- **State:** React Query (server state), Zustand (client state)
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion
- **Charts:** Recharts / D3.js

### Backend
- **Framework:** NestJS (controllers, services, modules)
- **Language:** TypeScript (strict)
- **ORM:** Prisma (PostgreSQL)
- **Cache:** Redis (ioredis)
- **Auth:** JWT + Passport (local, Google, GitHub, Discord)
- **Queue:** BullMQ (background jobs)
- **Realtime:** Socket.IO (WebSocket gateway)
- **API:** REST + GraphQL, Swagger documentation

### DevOps
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Reverse Proxy:** Nginx

## Features

### Authentication & Security
- Email/password registration with verification
- OAuth 2.0 (Google, GitHub, Discord)
- Two-factor authentication (TOTP)
- JWT access + refresh tokens
- Session management
- RBAC + ABAC authorization
- Rate limiting, CSRF, Helmet, encryption

### Advertising System
- 7 ad types: Banner, Video, Popup, Interstitial, Reward, Native, Auto
- Campaign management with budgeting and scheduling
- A/B testing for creatives
- Audience, geo, keyword, device targeting
- Real-time bidding simulation
- Fraud detection engine

### Publisher Management
- Website and ad unit management
- Ad placement configuration
- Revenue tracking and optimization
- Auto ad placement recommendations

### Analytics & Reporting
- Real-time dashboard with live updates
- CTR, CPM, CPC, CPA, ROI metrics
- Interactive charts and data tables
- Export to PDF, Excel, CSV
- Custom report builder

### Payment & Billing
- Stripe, Midtrans, PayPal integration
- QRIS and bank transfer support
- Automated invoicing
- Wallet system with withdrawals
- Subscription management
- Refund processing

### Admin Features
- User management (advertisers, publishers)
- System configuration
- Audit log viewer
- Fraud monitoring
- Revenue share management
- Notification broadcast

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### Installation

```bash
# Clone the repository
git clone https://github.com/adsphere/adsphere.git
cd adsphere

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start infrastructure
docker compose -f docker/docker-compose.dev.yml up -d

# Run database migrations
pnpm db:migrate

# Seed the database
pnpm db:seed

# Start development servers
pnpm dev
```

### Environment Variables

See [.env.example](.env.example) for all required environment variables.

### Access

| Service      | URL                     | Credentials              |
|-------------|------------------------|--------------------------|
| Frontend    | http://localhost:3000   | admin@adsphere.io / admin |
| API         | http://localhost:4000   | -                        |
| Swagger     | http://localhost:4000/docs | -                       |
| Prisma Studio | http://localhost:5555  | -                        |

## Scripts

| Command              | Description                    |
|---------------------|--------------------------------|
| `pnpm dev`          | Start all dev servers          |
| `pnpm build`        | Build all packages             |
| `pnpm test`         | Run all tests                  |
| `pnpm lint`         | Lint all packages              |
| `pnpm typecheck`    | TypeScript type checking       |
| `pnpm format`       | Format code with Prettier      |
| `pnpm db:migrate`   | Run database migrations        |
| `pnpm db:seed`      | Seed database                  |
| `pnpm db:studio`    | Open Prisma Studio             |

## API Documentation

- **REST API:** http://localhost:4000/docs (Swagger UI)
- **GraphQL:** http://localhost:4000/graphql (GraphQL Playground)
- **Postman Collection:** [docs/api/adsphere.postman.json](docs/api/adsphere.postman.json)

### API Versioning

API versioning via URL prefix: `/api/v1/*`

### Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

## Testing

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:e2e

# With coverage
pnpm test -- --coverage
```

**Coverage target:** > 90%

## Deployment

### Docker Deployment

```bash
# Production build
pnpm build

# Start production stack
docker compose -f docker/docker-compose.prod.yml up -d --build
```

### Manual Deployment

See [Deployment Guide](docs/deployment/deployment-guide.md).

## Project Structure

```
backend/src/
├── main.ts                    # Entry point
├── app.module.ts             # Root module
├── config/                   # App configuration
├── prisma/                   # Database service
├── redis/                    # Cache service
├── common/                   # Shared utilities
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   └── constants/
├── modules/
│   ├── auth/                 # Authentication
│   ├── users/                # User management
│   ├── roles/                # RBAC/ABAC
│   ├── campaign/             # Campaigns
│   ├── advertisement/        # Ad creatives
│   ├── publisher/            # Publishers
│   ├── website/              # Websites
│   ├── adunit/               # Ad units
│   ├── analytics/            # Analytics
│   ├── payment/              # Payments
│   ├── wallet/               # Wallets
│   ├── invoicing/            # Invoices
│   ├── notification/         # Notifications
│   ├── audit/                # Audit logs
│   └── fraud/                # Fraud detection
├── websocket/                # Real-time gateway
├── queue/                    # Background jobs
└── graphql/                  # GraphQL resolvers
```

```
frontend/src/
├── app/                      # Next.js App Router
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Dashboard pages
│   └── landing/              # Marketing pages
├── components/
│   ├── ui/                   # Shadcn UI components
│   ├── layout/               # Layout components
│   ├── forms/                # Form components
│   ├── charts/               # Chart components
│   ├── campaign/             # Campaign components
│   ├── analytics/            # Analytics components
│   └── ads/                  # Ad display components
├── lib/                      # Utility functions
├── hooks/                    # React hooks
├── services/                 # API services
└── providers/                # Context providers
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, development process, and contribution guidelines.

## Security

See [SECURITY.md](SECURITY.md) for our security policy and vulnerability reporting process.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## Support

- [Documentation](docs/)
- [GitHub Issues](https://github.com/adsphere/adsphere/issues)
- [GitHub Discussions](https://github.com/adsphere/adsphere/discussions)
- Email: support@adsphere.io

---

<div align="center">
Built with ❤️ by the AdSphere Team
</div>
