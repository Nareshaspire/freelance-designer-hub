# 🎨 Freelance Designer Hub

> All-in-one freelance designer management platform — project management, time tracking, invoicing, portfolio, and client communication.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [1. User Profiles](#1--user-profiles)
  - [2. Project Posting, Bidding & Management](#2--project-posting-bidding--management)
  - [3. Time Tracking](#3--time-tracking)
  - [4. Invoicing & Payment Processing](#4--invoicing--payment-processing)
  - [5. Communication Tools](#5--communication-tools)
  - [6. Skill Development Resources](#6--skill-development-resources)
  - [7. Analytics Dashboard](#7--analytics-dashboard)
  - [8. Third-Party Integrations](#8--third-party-integrations)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Phases](#development-phases)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Freelance Designer Hub** is a comprehensive platform built for freelance graphic designers who juggle multiple clients and projects. It combines project management, time tracking, client discovery, portfolio showcasing, and secure payment processing into a single, seamless application.

### Target Audience
- **Freelance designers** (graphic, web, UI/UX, branding, motion graphics)
- **Clients** looking to hire freelance design talent
- **Design agencies** managing distributed teams

---

## Features

### 1. 👤 User Profiles

| Feature | Freelancer | Client |
|---|---|---|
| Profile photo & bio | ✅ | ✅ |
| Portfolio gallery (images, PDFs, links) | ✅ | ❌ |
| Skills & expertise tags | ✅ | ❌ |
| Star ratings & written reviews | ✅ (received) | ✅ (received) |
| Work history & completed projects | ✅ | ✅ |
| Verification badges | ✅ | ✅ |
| Social links (Behance, Dribbble, LinkedIn) | ✅ | ✅ |

### 2. 📋 Project Posting, Bidding & Management

- **Clients** post projects with title, description, budget (fixed/hourly), timeline, required skills
- **Freelancers** browse, search, and submit bids with proposed rate, timeline, and portfolio samples
- **Project lifecycle:** `Draft → Open → In Progress → Review → Completed → Closed`
- Milestone-based delivery with approval gates
- Kanban board view for task management
- Dispute resolution system

### 3. ⏱️ Time Tracking

- Start/stop/pause timer per project or task
- Manual time entry with notes
- Optional screenshot & activity capture (privacy-respecting)
- Daily/weekly timesheets with approval workflow
- Idle detection and configurable alerts
- Exportable reports (CSV, PDF)

### 4. 💳 Invoicing & Payment Processing

- Auto-generated invoices from tracked time or milestones
- Custom branded invoice templates with line items, tax, discounts
- **Payment gateways:** Stripe, PayPal, bank transfer (ACH/SEPA)
- Escrow system for milestone-based payments
- Multi-currency support
- Recurring invoices for retainer clients
- Auto-reminders for overdue payments
- Tax reports and exportable 1099/tax summaries
- **Invoice statuses:** `Draft → Sent → Viewed → Paid → Overdue`

### 5. 💬 Communication Tools

- **Real-time chat** — 1:1 and project group chats with file sharing
- **Video & audio calls** — WebRTC-based, in-app with screen sharing
- **Message threading** and pinning
- **@mentions** and read receipts
- **Notification center** — in-app, email, and push notifications
- **Activity feed** — project-level timeline of all actions

### 6. 📚 Skill Development Resources

- Curated course library (UI/UX, branding, motion graphics, etc.)
- Video lessons, articles, and downloadable resources
- Skill assessments with quizzes and certifications
- Personalized learning paths based on profile and project history
- Community forums and mentorship matching
- Progress tracking dashboard

### 7. 📊 Analytics Dashboard

#### Income Analytics
- Total earnings (monthly/quarterly/yearly)
- Revenue breakdown by client, project type, and skill
- Invoice status overview (paid, pending, overdue)

#### Project Analytics
- Active vs. completed projects over time
- Average project duration and bid success rate
- Client satisfaction scores

#### Time Management
- Hours tracked per project/client/week
- Productive hours vs. idle time
- Peak productivity heatmap

#### Visualizations
- Interactive charts (bar, line, pie, heatmap)
- Exportable PDF/CSV reports
- Goal setting and progress indicators

### 8. 🔗 Third-Party Integrations

| Integration | Purpose |
|---|---|
| **GitHub** | Link repos, track commits, showcase code contributions |
| **Trello** | Sync project boards and task cards |
| **Slack** | Push notifications, project updates, chat bridging |
| **Google Calendar** | Sync deadlines, meetings, milestones |
| **Figma / Adobe CC** | Embed design files, link assets |
| **Zapier** | Custom automation workflows |
| **Dropbox / Google Drive** | Cloud file storage and sharing |
| **QuickBooks / Xero** | Accounting and bookkeeping sync |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React / Next.js (Web), React Native (Mobile) |
| **Backend** | Node.js with NestJS |
| **Database** | PostgreSQL (relational) + Redis (caching) |
| **Real-time** | WebSockets (Socket.io) / WebRTC (video calls) |
| **Payments** | Stripe Connect + PayPal API |
| **File Storage** | AWS S3 / Cloudflare R2 |
| **Search** | Elasticsearch |
| **Authentication** | OAuth 2.0 + JWT (Google, GitHub, Email SSO) |
| **CI/CD** | GitHub Actions |
| **Hosting** | AWS / Vercel (frontend) + Docker / Kubernetes |

---

## Project Structure

```
freelance-designer-hub/
├── client/                  # Frontend (Next.js)
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   ├── store/           # State management
│   │   ├── styles/          # Global styles & themes
│   │   └── utils/           # Utility functions
│   └── package.json
├── server/                  # Backend (NestJS)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Authentication & authorization
│   │   │   ├── users/       # User profiles & portfolio
│   │   │   ├── projects/    # Project CRUD & bidding
│   │   │   ├── time-tracking/ # Timer & timesheets
│   │   │   ├── invoicing/   # Invoice & payment processing
│   │   │   ├── chat/        # Real-time messaging
│   │   │   ├── video/       # Video call signaling
│   │   │   ├── courses/     # Skill development resources
│   │   │   ├── analytics/   # Dashboard & reporting
│   │   │   └── integrations/ # Third-party integrations
│   │   ├── common/          # Shared guards, pipes, filters
│   │   └── config/          # App configuration
│   └── package.json
├── mobile/                  # Mobile app (React Native)
├── docs/                    # Documentation
├── .github/
│   └── workflows/           # CI/CD pipelines
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 15
- Redis >= 7
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Nareshaspire/freelance-designer-hub.git
cd freelance-designer-hub

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database, Stripe, and API keys

# Run database migrations
cd ../server
npm run migration:run

# Start development servers
npm run start:dev        # Backend on http://localhost:3000
cd ../client
npm run dev              # Frontend on http://localhost:3001
```

---

## Development Phases

| Phase | Scope | Timeline |
|---|---|---|
| **Phase 1 — MVP** | User profiles, project posting/bidding, basic chat, invoicing | 8–10 weeks |
| **Phase 2 — Core** | Time tracking, escrow payments, video calls, reviews | 6–8 weeks |
| **Phase 3 — Growth** | Analytics dashboard, skill courses, integrations (GitHub, Slack, Trello) | 6–8 weeks |
| **Phase 4 — Scale** | Advanced search, AI recommendations, mobile app, Zapier integration | Ongoing |

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgments

Built with ❤️ for the freelance design community.