# OpsDesk

OpsDesk is an internal ops dashboard where teams track work items such as incidents, customer issues, payments, compliance requests and tasks.
Each person sees an **All teams** overview (live clock, org-wide stats, charts, items that need attention) and can open any team to view, create, edit and approve its work items.
What you can do in a team depends on your role there: Lead and Admin can approve, Members can create and edit, Viewers and non-members are read-only.

**Live demo:** https://ops-desk-mu.vercel.app

## Screenshots

| All teams overview | Team dashboard | Database Schema | Workflow
| :---: | :---: | :---: | :---: |
| ![All teams overview](./screenshots/1.png) | (./screenshots/2.png) | (./screenshots/3.png) | (./screenshots/4.png)
| ![Database Schema](./screenshots/5.png)

## Architecture

```mermaid
flowchart LR
    U([User / Browser])

    subgraph Client["client: React + Vite + Tailwind + RTK Query"]
        direction TB
        PG["pages<br/>Login, Register, DashBoard, WorkItemDetail"]
        CMP["components<br/>dashboard, layout, dialogs,<br/>charts, shared, ui"]
        ST[("stores<br/>authSlice, userSlice<br/>+ RTK Query API slices")]
        LIB["hooks and lib<br/>derived stats, constants, helpers"]
        PG --> CMP
        PG --> ST
        PG --> LIB
    end

    subgraph Server["server: Express + TypeScript + Prisma"]
        direction TB
        MW["middlewares<br/>requireAuth, requireTeamRole,<br/>idempotency"]
        API["REST routes<br/>auth, teams, work-items,<br/>comments, activities, users"]
        SVC["services / workers<br/>OutboxService, outbox worker"]
        DB[("PostgreSQL<br/>(Supabase)")]
        MW --> API
        API --> SVC
        SVC --> DB
        API --> DB
    end

    U --> Client
    Client -- "HTTPS / JSON + Bearer token" --> MW
```

### How the dashboard page works

```mermaid
flowchart TD
    D["pages/DashBoard.jsx<br/>owns all state"] -->|activeTeamId = null| O["All teams overview"]
    D -->|activeTeamId = team id| T["Single team dashboard"]

    O --> O1["LiveClockCard, org stats"]
    O --> O2["TeamsWorkloadChart, StatusMixCard"]
    O --> O3["NewItemsCard, PriorityMixCard, NeedsAttentionCard"]
    O --> O4["TeamCard grid"]
    O4 -->|onSelectTeam| D

    T --> T1["TeamBanner, stat cards"]
    T --> T2["StatusOverviewCard, NewItemsCard, WorkloadCard"]
    T --> T3["RecentActivityCard, WorkItemsCard"]
    T --> T4["TeamMembersCard"]
    T -->|view = users| UV["UsersView — paginated user list<br/>Admins can add members here"]
    T3 -->|"Create / Edit dialogs"| D
    T3 -->|ExternalLink button| WD["pages/WorkItemDetail.jsx<br/>full item view, comments, activity log"]
```

State lives in `DashBoard.jsx`. Cards receive data as props and report user actions through callbacks (`onGoTo`, `onSelect`, `onOpenItem`, `onSelectTeam`). All remote data is fetched and cached via **RTK Query** API slices; there is no mock data in production.

### Roles and permissions

| Role in a team | View items | Create / edit items | Approve | Add members |
| --- | :---: | :---: | :---: | :---: |
| Admin | yes | yes | yes | yes |
| Lead | yes | yes | yes | yes |
| Member | yes | yes | no | no |
| Viewer | yes | no | no | no |
| Not a member | yes (read-only) | no | no | no |

Role checks are enforced on **both** the client (UI gating) and the server (`requireTeamRole` middleware on every mutating route).

## Project structure

```
OpsDesk/
├── client/                       React app (Vite + Tailwind)
│   └── src/
│       ├── components/
│       │   ├── auth/             Protected route wrapper
│       │   ├── charts/           AreaChart, DonutChart
│       │   ├── dashboard/        AllTeamsOverview, WorkItemsCard, UsersView, …
│       │   ├── dialogs/          CreateItemDialog, EditItemDialog
│       │   ├── layout/           Sidebar, Header, MobileDrawer
│       │   ├── shared/           UserAvatar, Chip, StatusBadge, PriorityBadge
│       │   └── ui/               shadcn/ui primitives
│       ├── hooks/                useDashboardData.js
│       ├── lib/                  constants.js, helpers.js, chartColors.js, utils.js
│       ├── pages/                Login, Register, DashBoard, WorkItemDetail
│       └── stores/
│           ├── store.js
│           └── slices/           authSlice, userSlice,
│                                 teamApiSlice, workItemsApiSlice,
│                                 commentsApiSlice, activitiesApiSlice,
│                                 usersApiSlice
└── server/                       Express + TypeScript API
    └── src/
        ├── controllers/          auth, teams, workItems, comments, activities, users
        ├── middlewares/          auth.middleware, idempotency.middleware
        ├── routes/               auth, teams, workItems, comments, activities, users
        ├── services/             outbox.service
        ├── workers/              outbox.worker
        └── index.ts              entry point (port 3000)
```

## Prerequisites

- Node.js 18 or newer and npm
- A PostgreSQL database (the project is configured for [Supabase](https://supabase.com) but any PostgreSQL instance works)

## Run locally

```bash
# 1. clone
git clone https://github.com/LuckyBaliyan/OpsDesk.git
cd OpsDesk

# 2. start the server
cd server
npm install          # also runs: prisma generate (postinstall)
# copy the example env and fill in your values
cp .env.example .env
npm run dev          # nodemon + ts-node/esm, hot-reloads on port 3000

# 3. start the client (in a second terminal)
cd ../client
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

### Environment variables

**server** — create `server/.env`:

| Variable | Example | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Prisma / PostgreSQL connection string |
| `PORT` | `3000` | Port the Express API listens on |
| `JWT_SECRET` | `a-long-random-string` | Signs and verifies JWT access tokens |

**client** — create `client/.env`:

| Variable | Example | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000` | Base URL of the server API |

## Demo login credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `rahul@example.com` | `securepassword123` |
| Lead | `Test4@gmail.com` | `test4` |
| Member | `doe@gmail.com` | `doe123` |
| Viewer | `Test3@gmail.com` | `test3` |

Roles are per team — one account can be Admin in one team and Viewer in another.

## Tests

No automated test suite is set up yet.

```bash
# server (placeholder)
cd server && npm test

# client (placeholder)
cd client && npm test
```

## Known limitations

- Work items carry a `version` field for optimistic locking, but concurrent-edit conflicts (two people saving the same item at the same time) surface as an error toast but are not automatically resolved.
- Filtering, search and pagination for work items run in the browser against the full item list fetched from `GET /work-items/all`, so the app is not optimised for very large item counts. Server-side pagination is recommended at scale.
- Org-wide charts and counts in the All teams overview are computed client-side from the full item list. Aggregate endpoints would be more efficient at scale.
- No real-time updates — data refreshes only when the page is revisited or a mutation invalidates the RTK Query cache.
- The live clock uses the browser's locale and timezone.
- Non-members can view another team's work items (read-only) because `GET /work-items/all` is not scoped to membership. This is intentional for visibility but may need revisiting for stricter data isolation.