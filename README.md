<p align="center">
  <img src="public/assets/oermos-logo-horizontal.svg" alt="Oermos" width="280">
</p>

<p align="center">
  <strong>Communication Infrastructure Layer for the Oasis Company Ecosystem.</strong>
</p>

<p align="center">
  <a href="#-quick-start"><b>Quick Start</b></a> •
  <a href="#-architecture"><b>Architecture</b></a> •
  <a href="#-tech-stack"><b>Tech Stack</b></a> •
  <a href="#-documentation"><b>Docs</b></a>
</p>

---

> **Oermos is the communication infrastructure layer for Oasis Company.** Built on top of OasisBio's identity system, it provides unified communication capabilities with type-safe identity resolution, caching, and graceful error handling.

---

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Jest-Testing-red?style=flat-square&logo=jest" alt="Jest"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/>
</p>

## ✨ What is Oermos?

**Oermos is the communication infrastructure layer for the Oasis Company ecosystem.**

Built as a companion library to OasisBio, Oermos provides type-safe access to identity data and communication preferences. It serves as the bridge between OasisBio's identity layer and your application's communication needs.

### Core Features

| Feature | Description |
|---------|-------------|
| 🔗 **OasisBio API Client** | Type-safe client for interacting with OasisBio REST API |
| 🧬 **Identity Resolution** | Resolve user identity with automatic caching |
| ⚡ **TTL Cache** | In-memory cache with configurable expiration |
| 🔄 **Retry Logic** | Automatic retries for transient network failures |
| 🛡️ **Error Handling** | Structured error classes for API and network errors |
| 📦 **Type Safety** | Complete TypeScript support with OasisBio-compatible types |
| 🪝 **Webhook Support** | Receive real‑time events from OasisBio with signature verification |

### How Oermos Fits in the Oasis Company Ecosystem

```
┌──────────────────────────────────────────────────────────────┐
│                    Oasis Company Ecosystem                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │     OasisBio          │        │      Oermos           │  │
│  │  (Identity Layer)     │◄───────│  (Communication)      │  │
│  │                       │   API  │                       │  │
│  │  • User Management    │        │  • Identity Access    │  │
│  │  • OAuth Provider     │        │  • Communication Pref │  │
│  │  • Profile Storage    │        │  • Caching Layer      │  │
│  │  • DCOS Repository    │        │                       │  │
│  └──────────────────────┘        └──────────────────────┘  │
│                                                              │
│                    PostgreSQL (Shared Database)               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Oermos Architecture                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    Application Layer                    │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                               │                                │
│  ┌──────────────────────────▼─────────────────────────────┐  │
│  │               IdentityService (Caching Layer)            │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  TTL Cache  │  │ Profile Mgmt │  │ Pref Access │  │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                               │                                │
│  ┌──────────────────────────▼─────────────────────────────┐  │
│  │                 OasisBioClient (HTTP)                    │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Auth Token │  │ Retry Logic  │  │ Error Handle │  │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                               │                                │
│  ┌──────────────────────────▼─────────────────────────────┐  │
│  │              OasisBio REST API (External)                │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### By The Numbers

| Metric | Value |
|--------|-------|
| **API Client** | Full type-safe coverage |
| **Caching** | In-memory TTL cache |
| **Error Types** | 2 (ApiError, NetworkError) |
| **Type Coverage** | 100% TypeScript |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | 5.4 (strict) |
| Runtime | Node.js | 18+ |
| HTTP Client | Native fetch | — |
| Testing | Jest | latest |
| Package Manager | npm | — |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **OasisBio** running and accessible

### Installation

```bash
npm install oermos
```

### Configuration

Create a `.env` file:

```env
OASIS_BIO_API_URL=http://localhost:3000
```

### Basic Usage

```typescript
import { IdentityService, OasisBioClient } from 'oermos';

// Using IdentityService (recommended)
const service = new IdentityService({ cacheTTL: 5 * 60 * 1000 });

const profile = await service.resolveIdentity('your-auth-token');
console.log(profile.user);
console.log(profile.profile);

// Using client directly
const client = new OasisBioClient();
const profile = await client.getProfile({ authToken: 'your-auth-token' });
```

---

## 🪝 Webhooks

Oermos supports receiving real‑time events from OasisBio via webhooks, with automatic signature verification and cache invalidation.

### Setting Up Webhooks

```typescript
import {
  IdentityService,
  WebhookHandler,
  WebhookEventType,
  createWebhookEndpoint,
} from 'oermos';
import express from 'express';

// 1. Initialize services
const identityService = new IdentityService({ cacheTTL: 5 * 60 * 1000 });
const webhookHandler = new WebhookHandler({ identityService });

// 2. Register custom event handlers
webhookHandler.on(WebhookEventType.ProfileUpdated, (payload) => {
  console.log('Profile updated!', {
    userId: payload.data.userId,
    profile: payload.data.profile
  });
});

webhookHandler.on(WebhookEventType.UserCreated, (payload) => {
  console.log('New user created!', {
    userId: payload.data.user.id,
    user: payload.data.user
  });
});

webhookHandler.on(WebhookEventType.UserDeleted, (payload) => {
  console.log('User deleted!', { userId: payload.data.userId });
});

// 3. Create Express endpoint
const app = express();

// Important: Save raw body for signature verification
app.use(express.json({
  verify: (req, res, buf) => { (req as any).rawBody = buf.toString(); }
}));

// Create webhook endpoint
const webhookEndpoint = createWebhookEndpoint({
  secret: process.env.OASISBIO_WEBHOOK_SECRET || 'your-secret',
  handler: webhookHandler,
});

app.post('/webhook/oasisbio', webhookEndpoint);

app.listen(3001, () => {
  console.log('Webhook server listening on port 3001');
});
```

### Webhook Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `secret` | string | Your webhook secret from OasisBio (required) |
| `handler` | WebhookHandler | Handler instance to process events (required) |
| `tolerance` | number | Timestamp tolerance in ms (default: 5 minutes) |

### Webhook Event Types

| Event Type | Description |
|------------|-------------|
| `WebhookEventType.ProfileUpdated` | Triggered when a user's profile is updated |
| `WebhookEventType.UserCreated` | Triggered when a new user is created |
| `WebhookEventType.UserDeleted` | Triggered when a user is deleted |

### Failed Events

Oermos automatically tracks failed webhook events:

```typescript
// Get all failed events
const failedEvents = webhookHandler.getFailedEvents();

// Clear failed events
webhookHandler.clearFailedEvents();
```

For a complete example, see [`examples/webhook-usage.ts`](examples/webhook-usage.ts).

---

## 📁 Project Structure

```
oermos/
├── src/
│   ├── client/
│   │   ├── index.ts
│   │   ├── oasisbio.ts      # Type-safe API client
│   │   └── errors.ts        # Error classes
│   ├── services/
│   │   ├── index.ts
│   │   ├── identity.ts      # Identity resolution service
│   │   └── webhook-handler.ts # Webhook event handler
│   ├── types/
│   │   ├── index.ts
│   │   ├── oasisbio.ts      # OasisBio model types
│   │   ├── api.ts           # API request/response types
│   │   └── webhook.ts       # Webhook types
│   ├── utils/
│   │   ├── index.ts
│   │   ├── cache.ts         # TTL cache implementation
│   │   └── verify-webhook.ts # Webhook signature verification
│   ├── webhook/
│   │   └── index.ts         # Webhook endpoint
│   ├── config.ts            # Environment configuration
│   └── index.ts             # Main entry point
├── public/
│   └── assets/
│       └── oermos-logo-horizontal.svg
├── examples/
│   ├── basic-usage.ts
│   ├── identity-service-demo.ts
│   └── webhook-usage.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## 🧪 Testing

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [README](README.md) | Project overview and quick start |
| [Spec Document](.trae/specs/hybrid-redesign/spec.md) | Full product specification |
| [OasisBio Docs](https://github.com/zbbsdsb/oasisbio) | Identity system documentation |

---

## 🤝 Contributing

Contributions are welcome!

1. **Fork** the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Make changes with **clear commit messages**
4. Run `npm run lint` and `npm test` to validate
5. Push to your fork and open a **Pull Request**

### Development Workflow

- **TypeScript strict mode** — all code must pass type checking
- Follow existing code style (ESLint config included)
- New features should include tests where practical
- Keep types in sync with OasisBio's Prisma schema

---

## 📄 License

MIT © 2026 [Oasis Company](https://github.com/zbbsdsb)

See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with care by [Oasis Company](https://github.com/zbbsdsb).**

*Communication infrastructure layer for the Oasis Company ecosystem.* 🌊

[Report Bug](https://github.com/zbbsdsb/oermos/issues) · [Request Feature](https://github.com/zbbsdsb/oermos/issues)

</div>
