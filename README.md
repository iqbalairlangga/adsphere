<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/AdSphere-Enterprise%20Advertising%20Platform-%23FF6B35?style=for-the-badge&labelColor=%231a1a2e&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMjAgMkwyIDMySDM4TDIwIDJ6IiBmaWxsPSIjRkY2QjM1Ii8+PHBhdGggZD0iTTIwIDhMMTIgMjRIMjhMMjAgOHoiIGZpbGw9IndoaXRlIi8+PC9zdmc+">
    <img src="https://img.shields.io/badge/AdSphere-Enterprise%20Advertising%20Platform-%23FF6B35?style=for-the-badge&labelColor=%231a1a2e&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMjAgMkwyIDMySDM4TDIwIDJ6IiBmaWxsPSIjRkY2QjM1Ii8+PHBhdGggZD0iTTIwIDhMMTIgMjRIMjhMMjAgOHoiIGZpbGw9IndoaXRlIi8+PC9zdmc+" alt="AdSphere">
  </picture>
</div>

<p align="center">
  <strong>Enterprise-Grade Digital Advertising Platform</strong><br>
  <em>Connecting advertisers, publishers, and administrators in a unified, secure, and scalable ecosystem.</em>
</p>

<p align="center">
  <a href="#-features"><strong>Features</strong></a> ·
  <a href="#-quick-start"><strong>Quick Start</strong></a> ·
  <a href="#-architecture"><strong>Architecture</strong></a> ·
  <a href="#-tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#-api-documentation"><strong>API</strong></a> ·
  <a href="#-contributing"><strong>Contributing</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/iqbalairlangga/adsphere/ci.yml?branch=main&label=CI&logo=github&style=flat-square" alt="CI">
  <img src="https://img.shields.io/github/actions/workflow/status/iqbalairlangga/adsphere/cd.yml?branch=main&label=CD&logo=github&style=flat-square" alt="CD">
  <img src="https://img.shields.io/codecov/c/github/iqbalairlangga/adsphere?label=coverage&logo=codecov&style=flat-square" alt="Coverage">
  <img src="https://img.shields.io/github/v/release/iqbalairlangga/adsphere?label=version&logo=semver&style=flat-square" alt="Version">
  <img src="https://img.shields.io/github/license/iqbalairlangga/adsphere?label=license&style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome">
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- Email/password registration with email verification
- OAuth 2.0 (Google, GitHub, Discord) social login
- Two-factor authentication (TOTP) via authenticator apps
- JWT access + refresh token rotation
- RBAC + ABAC fine-grained authorization
- Rate limiting, CSRF protection, Helmet security headers
- Data encryption at rest and in transit

</td>
<td width="50%">

### 📢 Advertising System
- **7 ad types:** Banner, Video, Popup, Interstitial, Reward, Native, Auto
- Campaign management with daily & total budget controls
- A/B testing for creatives and placements
- Audience, geo, keyword, device, and time-based targeting
- Real-time bidding (RTB) simulation engine
- ML-powered fraud detection with velocity checks
- Ad scheduling & frequency capping

</td>
</tr>
<tr>
<td width="50%">

### 📊 Analytics & Reporting
- Real-time dashboard with Socket.IO live updates
- CTR, CPM, CPC, CPA, ROAS, and LTV metrics
- Interactive charts (Recharts / D3.js)
- Export to **PDF**, **Excel**, **CSV**
- Custom report builder with saved templates
- Cohort analysis and funnel visualization
- Performance alerts and anomaly detection

</td>
<td width="50%">

### 💳 Payment & Billing
- **Stripe**, **Midtrans**, **PayPal** payment gateways
- **QRIS** and bank transfer for Indonesia market
- Automated monthly invoicing
- Digital wallet with deposits & withdrawals
- Subscription & prepaid billing models
- Refund processing with audit trail
- Multi-currency support

</td>
</tr>
<tr>
<td width="50%">

### 🌐 Publisher Management
- Website & ad unit management dashboard
- Ad placement configuration with preview
- Revenue tracking & optimization suggestions
- Auto ad placement recommendations
- Fill rate & eCPM analytics
- Payment & payout scheduling

</td>
<td width="50%">

### 🛡️ Admin & Operations
- User management for advertisers & publishers
- System-wide configuration panel
- Audit log viewer with search & filter
- Fraud monitoring & case management
- Revenue share configuration
- Broadcast notifications
- Health monitoring & metrics

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | ≥ 20.x |
| **pnpm** | ≥ 9.x |
| **Docker** | ≥ 24.x |
| **Docker Compose** | ≥ 2.x |
| **PostgreSQL** | 16.x |
| **Redis** | 7.x |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/iqbalairlangga/adsphere.git
cd adsphere

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env

# 4. Start infrastructure (PostgreSQL, Redis)
docker compose -f docker/docker-compose.dev.yml up -d

# 5. Run database migrations
pnpm db:migrate

# 6. Seed demo data
pnpm db:seed

# 7. Launch development servers
pnpm dev
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| 🌐 **Frontend** | [http://localhost:3000](http://localhost:3000) | `admin@adsphere.io` / `admin` |
| ⚡ **API** | [http://localhost:4000](http://localhost:4000) | — |
| 📖 **Swagger** | [http://localhost:4000/docs](http://localhost:4000/docs) | — |
| 🗄️ **Prisma Studio** | [http://localhost:5555](http://localhost:5555) | — |

---

## 🏗️ Architecture

```
adsphere/
├── backend/          # NestJS API server (controllers, services, modules)
├── frontend/         # Next.js 14 web application (App Router)
├── packages/         # Shared monorepo libraries
│   ├── shared/       # Common types, utilities, validators
│   ├── eslint-config # Unified ESLint configuration
│   └── tsconfig      # Shared TypeScript configurations
├── docker/           # Docker Compose stacks (dev / prod)
├── database/         # Database migrations, seeds, backups
├── infra/            # Infrastructure as Code (Terraform)
├── scripts/          # Automation & CI/CD scripts
├── tests/            # E2E & integration test suites
└── docs/             # Technical documentation
```

### Backend Structure

```
backend/src/
├── main.ts                     # Application entry point
├── app.module.ts              # Root NestJS module
├── config/                    # Environment-based configuration
├── prisma/                    # Prisma database service
├── redis/                     # Redis cache service
├── common/                    # Shared cross-cutting concerns
│   ├── decorators/            # Custom decorators (@CurrentUser, @Public)
│   ├── filters/               # Exception filters
│   ├── guards/                # Auth, Roles, Permissions guards
│   ├── interceptors/          # Transform, Logging, Cache interceptors
│   ├── middleware/            # Request middleware
│   ├── pipes/                 # Validation & transformation pipes
│   └── constants/             # Enums, constants, configuration keys
├── modules/                   # Domain-driven feature modules
│   ├── auth/                  # Authentication & authorization
│   ├── users/                 # User management
│   ├── roles/                 # RBAC/ABAC permission system
│   ├── campaign/              # Campaign management
│   ├── advertisement/         # Ad creative & placement
│   ├── publisher/             # Publisher dashboard
│   ├── analytics/             # Analytics engine
│   ├── payment/               # Payment processing
│   ├── wallet/                # Digital wallet
│   ├── invoicing/             # Invoice generation
│   ├── notification/          # Notifications
│   ├── audit/                 # Audit logging
│   └── fraud/                 # Fraud detection
├── websocket/                 # Socket.IO real-time gateway
├── queue/                     # BullMQ background job processing
└── graphql/                   # GraphQL resolvers & schemas
```

### Frontend Structure

```
frontend/src/
├── app/                       # Next.js App Router pages
│   ├── auth/                  # Login, Register, Forgot/Reset Password
│   └── dashboard/             # Dashboard pages (campaign, analytics, wallet, etc.)
├── components/
│   ├── ui/                    # Shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── layout/                # Shell layout, sidebar, navbar
│   ├── forms/                 # Form components & validation
│   ├── charts/                # Chart & data visualization components
│   ├── campaign/              # Campaign-specific components
│   ├── analytics/             # Analytics dashboard widgets
│   └── ads/                   # Ad display & render components
├── lib/                       # Utility functions & helpers
├── hooks/                     # Custom React hooks
├── services/                  # API client services
└── providers/                 # React context providers
```

---

## 🛠️ Tech Stack

<details>
<summary><strong>Frontend</strong></summary>

| Technology | Purpose |
|------------|---------|
| **Next.js 14** (App Router) | React framework with SSR/SSG |
| **TypeScript** (strict mode) | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/ui** | Accessible component library |
| **React Query** (TanStack) | Server state management |
| **Zustand** | Client state management |
| **React Hook Form + Zod** | Form validation |
| **Framer Motion** | Animations & transitions |
| **Recharts / D3.js** | Data visualization |
| **Socket.IO client** | Real-time updates |

</details>

<details>
<summary><strong>Backend</strong></summary>

| Technology | Purpose |
|------------|---------|
| **NestJS** | Node.js framework (controllers, services, modules) |
| **TypeScript** (strict mode) | Type-safe development |
| **Prisma** | Type-safe ORM for PostgreSQL |
| **Redis** (ioredis) | Caching, sessions, rate limiting |
| **JWT + Passport** | Authentication strategies |
| **BullMQ** | Background job processing |
| **Socket.IO** | WebSocket real-time gateway |
| **GraphQL** (code-first) | Flexible API queries |
| **Swagger / OpenAPI** | API documentation |
| **Winston** | Structured logging |

</details>

<details>
<summary><strong>DevOps</strong></summary>

| Technology | Purpose |
|------------|---------|
| **Docker** + **Compose** | Containerization |
| **GitHub Actions** | CI/CD pipelines |
| **PostgreSQL 16** | Primary database |
| **Redis 7** | Cache & message broker |
| **Nginx** | Reverse proxy & load balancing |
| **Turborepo** | Monorepo task orchestration |
| **pnpm** | Package manager (workspaces) |

</details>

---

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers concurrently |
| `pnpm build` | Build all packages and applications |
| `pnpm test` | Run all test suites |
| `pnpm test:e2e` | Run end-to-end tests |
| `pnpm lint` | Lint all packages with ESLint |
| `pnpm typecheck` | TypeScript type checking across all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed database with demo data |
| `pnpm db:studio` | Open Prisma Studio GUI |

---

## 📖 API Documentation

| Endpoint | Description |
|----------|-------------|
| **REST API** | `http://localhost:4000/api/v1/*` — [Swagger UI](http://localhost:4000/docs) |
| **GraphQL** | `http://localhost:4000/graphql` — GraphQL Playground |
| **Postman** | [Collection](docs/api/adsphere.postman.json) |

All protected endpoints require `Authorization: Bearer <token>` header.

---

## 🧪 Testing

```bash
# Run all unit tests
pnpm test

# Run integration / E2E tests
pnpm test:e2e

# Run with coverage report
pnpm test -- --coverage
```

> **Coverage target:** ≥ 90%

---

## 🌍 Deployment

<details>
<summary><strong>Docker (Production)</strong></summary>

```bash
pnpm build
docker compose -f docker/docker-compose.prod.yml up -d --build
```

</details>

<details>
<summary><strong>Manual Deployment</strong></summary>

See the [Deployment Guide](docs/deployment/deployment-guide.md) for step-by-step instructions for VM / bare-metal deployment.

</details>

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of conduct
- Development workflow
- Pull request process
- Coding standards

## 🔒 Security

Found a security vulnerability? Please see our [Security Policy](SECURITY.md) for responsible disclosure.

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 📬 Support

- 📚 [Documentation](docs/)
- 🐛 [GitHub Issues](https://github.com/iqbalairlangga/adsphere/issues)
- 💬 [GitHub Discussions](https://github.com/iqbalairlangga/adsphere/discussions)
- 📧 [support@adsphere.io](mailto:support@adsphere.io)

---

<div align="center">
  <sub>
    Built with ❤️ by the <strong>AdSphere Team</strong> · 
    <a href="https://adsphere.io">adsphere.io</a>
  </sub>
  <br>
  <sub>
    <a href="https://github.com/iqbalairlangga/adsphere">GitHub</a> ·
    <a href="https://github.com/iqbalairlangga/adsphere/issues">Report Bug</a> ·
    <a href="https://github.com/iqbalairlangga/adsphere/issues">Request Feature</a>
  </sub>
</div>
