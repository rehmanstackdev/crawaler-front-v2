# Crawaler — Frontend

React SPA for the Crawaler price comparison platform. Users can search and compare products from **Daraz** and **Telemart** using text or AI-powered image search, view variant groups side by side, and filter results by platform and price range.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Available Scripts](#available-scripts)
7. [Pages & Routes](#pages--routes)
8. [Features](#features)

---

## Overview

The frontend is a **React 18 + Vite** single-page application written in TypeScript. It communicates with the Crawaler backend via an Axios client that automatically attaches the JWT token to every request. Authentication state is managed globally through React Context.

---

## Tech Stack

| Package | Purpose |
|---------|---------|
| **React 18** | UI library |
| **Vite** | Dev server and production bundler |
| **TypeScript** | Static type checking |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible, pre-built component library (Radix UI) |
| **React Router v6** | Client-side routing and protected routes |
| **TanStack Query** | Server state, caching, and background refetching |
| **Axios** | HTTP client with JWT auth interceptor |
| **React Hook Form** | Performant form state management |
| **Zod** | Schema-based form validation |
| **Sonner** | Toast notifications |
| **Recharts** | Charts for the admin dashboard |
| **Lucide React** | Icon set |

---

## Project Structure

```
crawaler-frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthShell.tsx       # Shared auth page wrapper
│   │   │   └── ProtectedRoute.tsx  # Route guard (redirects to /login)
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Top nav with user menu
│   │   │   └── MainLayout.tsx      # Page wrapper with header
│   │   ├── ui/                     # shadcn/ui components
│   │   │   └── password-input.tsx  # Input with eye toggle
│   │   ├── ProductCard.tsx
│   │   ├── SearchSuggestInput.tsx  # Search bar with suggestions
│   │   └── VariantCard.tsx         # Compare-screen variant card
│   ├── contexts/
│   │   └── AuthContext.tsx         # JWT auth state (login, register, logout)
│   ├── data/
│   │   └── mockData.ts             # Static data for landing page
│   ├── lib/
│   │   ├── apiClient.ts            # Axios instance + auth interceptor
│   │   └── utils.ts                # cn() helper
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── VerifyOtp.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── admin/
│   │   │   └── Dashboard.tsx       # User management + stats
│   │   ├── Landing.tsx             # Public home page
│   │   ├── SearchResults.tsx       # /search — filterable results
│   │   ├── ProductSearch.tsx       # /compare — variant comparison
│   │   ├── ProductDetail.tsx       # /product/:id
│   │   └── NotFound.tsx
│   ├── services/
│   │   ├── authService.ts          # Login, register, OTP, reset calls
│   │   ├── productService.ts       # Text + image search calls
│   │   └── adminService.ts         # Admin API calls
│   ├── types/                      # TypeScript interfaces
│   ├── utils/
│   ├── App.tsx                     # Router and route definitions
│   └── main.tsx                    # React entry point
├── .env                            # Environment variables (never commit)
├── .env.example                    # Template for new developers
└── package.json
```

---

## Installation

### Prerequisites

- Node.js 18+
- npm 9+
- Crawaler backend running (see `crawaler-backend/README.md`)

### Steps

```bash
# 1. Move into the frontend directory
cd crawaler-frontend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Open .env and set VITE_API_URL to your backend URL

# 4. Start the development server
npm run dev
```

The app runs on `http://localhost:5173` by default.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the value before starting.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Base URL of the Crawaler backend API |

**Important:** All variables must be prefixed with `VITE_` so Vite can embed them into the production bundle at build time. They are inlined as static strings — do **not** store secrets (API keys, passwords) here.

```bash
# Development
VITE_API_URL=http://localhost:5000/api

# Production example
VITE_API_URL=https://api.yourcrawaler.com/api
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot module replacement |
| `npm run build` | Type-check and bundle for production (outputs to `dist/`) |
| `npm run preview` | Serve the production `dist/` build locally |
| `npm run lint` | Run ESLint across the codebase |
| `npm test` | Run Vitest unit tests once |
| `npm run test:watch` | Run Vitest in interactive watch mode |

---

## Pages & Routes

| Route | Access | Page | Description |
|-------|--------|------|-------------|
| `/` | Public | `Landing` | Hero, categories, featured products |
| `/login` | Public | `Login` | Email + password login |
| `/register` | Public | `Register` | Create an account |
| `/forgot-password` | Public | `ForgotPassword` | Request OTP email |
| `/verify-otp` | Public | `VerifyOtp` | Enter 6-digit OTP |
| `/reset-password` | Public | `ResetPassword` | Set new password |
| `/search` | Auth required | `SearchResults` | Search with filters + image search |
| `/compare` | Auth required | `ProductSearch` | Compare variant groups |
| `/product/:id` | Auth required | `ProductDetail` | Full product offer list |
| `/admin` | Admin only | `Dashboard` | User management + crawler stats |

---

## Features

- **Landing page** — hero banner, feature cards, category browser, featured products
- **Text search** — live results from Daraz & Telemart with pagination, grid/list view
- **Image search** — drag-and-drop or click to upload; Gemini AI identifies the product and searches automatically
- **Compare screen** — side-by-side variant groups showing all sellers and prices
- **Filters sidebar** — filter by platform (Daraz / Telemart) and price range, sort by price or rating
- **Product detail** — full offer breakdown with direct buy links
- **Auth flow** — register → login → forgot password (OTP email) → reset password
- **Password visibility toggle** — eye icon on all password fields
- **Protected routes** — unauthenticated users redirected to `/login`
- **Admin dashboard** — manage users, view crawler status and stats
- **Toast notifications** — feedback on login, register, logout, and image search
- **Responsive design** — mobile-first layout with sheet-based filter drawer on small screens
