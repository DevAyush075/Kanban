# Next.js 14/15 App Router Project Structure

This repository provides an enterprise-ready, scalable Next.js project structure using the App Router, TypeScript, and clean architecture principles.

---

## 📁 Folder Structure Overview

```
kanban/
├── public/                     # Static assets (images, icons, fonts)
│   ├── favicon.ico
│   └── images/
├── src/                        # Main application source code
│   ├── actions/                # Next.js Server Actions (mutations & data operations)
│   │   └── board.ts
│   ├── app/                    # Next.js App Router (Pages, Layouts & Endpoints)
│   │   ├── (auth)/             # Route group: Authentication pages (login, register)
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/        # Route group: Authenticated dashboard pages
│   │   │   └── boards/
│   │   │       └── page.tsx
│   │   ├── api/                # API Route handlers (REST / Webhooks)
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── globals.css         # Global CSS styles & design tokens
│   │   ├── layout.tsx          # Root layout wrapper
│   │   ├── loading.tsx         # Global loading UI boundary
│   │   ├── not-found.tsx       # Custom 404 page
│   │   └── page.tsx            # Home landing page
│   ├── components/             # React Components (Atomic design pattern)
│   │   ├── ui/                 # Low-level primitive components (Button, Input, Card)
│   │   ├── forms/              # Form components & validation schemas
│   │   ├── layout/             # Shell components (Navbar, Sidebar, Footer)
│   │   └── modules/            # Feature-specific components (KanbanBoard, Column)
│   ├── config/                 # Application configuration & constants
│   ├── hooks/                  # Reusable React custom hooks
│   ├── lib/                    # Core utilities, API clients & DB connections
│   │   └── utils.ts
│   ├── store/                  # Global state management (Zustand, Redux, Context)
│   ├── styles/                 # Additional design system tokens / CSS modules
│   ├── types/                  # TypeScript interface and type definitions
│   │   └── index.ts
│   └── middleware.ts           # Next.js Request Middleware (Auth, Geo, i18n)
├── .env.example                # Template for environment variables
├── .gitignore                  # Git untracked file rules
├── next.config.mjs             # Next.js configuration settings
├── package.json                # Project dependencies and script commands
├── README.md                   # Project documentation
└── tsconfig.json               # TypeScript compiler config with @/* path aliases
```

---

## 🛠 Features & Conventions

- **App Router (`src/app/`)**: Leverages Server Components by default for optimal performance and SEO.
- **Route Groups `(group)`**: Used to logically organize pages into feature areas without altering the URL path structure.
- **Path Aliases (`@/*`)**: Configured in `tsconfig.json` to resolve clean imports from the `src/` folder (e.g. `import { Button } from '@/components/ui/button'`).
- **Server Actions (`src/actions/`)**: Keeps server mutations type-safe and decoupled from client components.
- **Modular Components (`src/components/`)**: Separates generic UI primitives (`ui/`) from domain-specific feature modules (`modules/`).
"# Kanban" 
