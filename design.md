# OpsDesk Design System Specification

## 1. Overview & Design Philosophy

OpsDesk is an enterprise-grade operational management dashboard engineered for high-concurrency incident response, team triage, workload balancing, and workflow authorization. The interface balances high-density data presentation with clean visual hierarchy, immediate status recognition, and minimal cognitive overhead.

### Core Principles

1. **Dark-First Industrial Aesthetic**
   - Default state is an intentional, warm dark mode built on deep obsidian tones (`#0a0908` / `hsl(30 11% 4%)`) rather than sterile pure blacks.
   - High-contrast visual elements use warm cream accents (`#efe6e4` / `hsl(11 25% 91%)`) for primary interactive targets, creating an authoritative, modern developer-tool feel.

2. **Dual-Theme Parity**
   - A fully functional Light Mode counterpart is implemented through unified CSS variable tokens.
   - Light mode provides a crisp, paper-like surface (`#ffffff` / `hsl(0 0% 100%)`) with warm stone neutrals and balanced contrast ratios compliant with WCAG AA standards.

3. **Subdued Elevation & Structural Rigor**
   - Surface elevation is achieved primarily through subtle 1px border strokes (`border-border`) and tonal shifts (`bg-card`, `bg-muted/50`), avoiding exaggerated drop-shadows or noisy gradients.
   - Cards follow a standardized flat, border-governed structure (`gap-0 rounded-xl border border-border bg-card py-0 shadow-none ring-0`).

4. **Semantic Color Precision**
   - Color is used strictly for information transmission: operational status, urgency, trend indicators, and team workload distribution.
   - Semantic tokens maintain consistent hues across charts, status badges, and table rows to prevent visual ambiguity.

---

## 2. Foundations & Design Tokens

The OpsDesk design system utilizes CSS custom properties with HSL color channels (`hsl(var(--token) / <alpha-value>)`) and OKLCH color-space definitions managed through Tailwind CSS v4 and shadcn/ui.

### 2.1 Core Palette & Surface Tokens

| Token | Dark Mode (Default) | Light Mode | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `30 11% 4%` (`#0a0908`) | `0 0% 100%` (`#ffffff`) | Main application canvas background |
| `--foreground` | `0 0% 98%` (`#fafafa`) | `15 8% 9%` (`#181514`) | Primary text and primary icons |
| `--card` | `30 10% 5%` (`#0d0c0b`) | `0 0% 100%` (`#ffffff`) | Card and surface container backgrounds |
| `--card-foreground` | `0 0% 98%` (`#fafafa`) | `15 8% 9%` (`#181514`) | Primary content within cards |
| `--popover` | `30 8% 6%` (`#100f0e`) | `0 0% 100%` (`#ffffff`) | Dropdown menus, selects, popovers |
| `--popover-foreground` | `0 0% 98%` (`#fafafa`) | `15 8% 9%` (`#181514`) | Popover labels and options |
| `--sidebar` | `30 7% 6%` (`#0f0e0d`) | `20 14% 97%` (`#f8f6f5`) | Left navigation sidebar background |
| `--sidebar-foreground` | `0 0% 98%` (`#fafafa`) | `15 8% 9%` (`#181514`) | Navigation links, brand text |
| `--sidebar-accent` | `11 25% 91%` (`#efe6e4`) | `11 25% 91%` (`#efe6e4`) | Active navigation item highlight |
| `--sidebar-accent-foreground` | `15 8% 9%` (`#181514`) | `15 8% 9%` (`#181514`) | Text on active navigation item |
| `--sidebar-border` | `30 5% 12%` (`#1f1d1c`) | `20 6% 90%` (`#e6e4e2`) | Right divider of navigation sidebar |
| `--primary` | `11 25% 91%` (`#efe6e4`) | `15 8% 10%` (`#1c1817`) | Main call-to-action buttons, key brand badges |
| `--primary-foreground` | `15 8% 9%` (`#181514`) | `11 25% 94%` (`#f4eeed`) | Text and icons inside primary buttons |
| `--secondary` | `30 5% 10%` (`#1a1918`) | `20 10% 95%` (`#f4f2f0`) | Secondary actions, inactive pills |
| `--secondary-foreground` | `0 0% 98%` (`#fafafa`) | `15 8% 9%` (`#181514`) | Text inside secondary elements |
| `--muted` | `30 5% 10%` (`#1a1918`) | `20 10% 95%` (`#f4f2f0`) | Subdued backgrounds, table header fills |
| `--muted-foreground` | `24 6% 64%` (`#a8a29e`) | `24 6% 40%` (`#6a6562`) | Subtitles, helper text, empty states |
| `--accent` | `30 5% 12%` (`#1f1d1c`) | `20 10% 95%` (`#f4f2f0`) | Hover background states, interactive accents |
| `--accent-foreground` | `0 0% 98%` (`#fafafa`) | `15 8% 9%` (`#181514`) | Foreground text on hovered/accented nodes |
| `--border` | `30 5% 12%` (`#1f1d1c`) | `20 6% 90%` (`#e6e4e2`) | Universal 1px structural container borders |
| `--input` | `30 5% 14%` (`#242220`) | `20 6% 90%` (`#e6e4e2`) | Input and form control borders |
| `--ring` | `30 5% 35%` (`#5b5754`) | `24 6% 40%` (`#6a6562`) | Focus ring indicator stroke |

---

### 2.2 Semantic Work Item Status Tokens

Work items transition through 5 distinct operational states. Each status has a defined color family, border stroke, and light/dark badge styling.

| Status | Hex | Token / Class String | Visual Meaning |
| :--- | :--- | :--- | :--- |
| **Open** | `#0ea5e9` | `bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20` | Newly filed, awaiting triage |
| **InProgress** | `#f59e0b` | `bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20` | Actively being handled by assignee |
| **AwaitingApproval** | `#8b5cf6` | `bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20` | Blocked on Lead/Admin sign-off |
| **Resolved** | `#10b981` | `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20` | Remediation complete, ready for closure |
| **Closed** | `#71717a` | `bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20` | Archival state, fully concluded |

---

### 2.3 Priority & Severity Hierarchy

Work item urgency is categorized into four tiers:

| Priority | Hex | Class Composition | Operational Impact |
| :--- | :--- | :--- | :--- |
| **Low** | `#71717a` | `bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20` | Routine housekeeping or non-urgent backlog |
| **Medium** | `#0ea5e9` | `bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20` | Normal operations, standard SLA window |
| **High** | `#f97316` | `bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20` | Impaired service, customer impact imminent |
| **Urgent** | `#ef4444` | `bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20` | Active outage, critical SLA breach risk |

---

### 2.4 Trend & Metric Delta Tokens (`Chip`)

Metric cards indicate operational trajectory with compact, tinted indicator chips:

| Variant | Tone Class | Dark Mode Appearance | Light Mode Appearance | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Positive / Up** | `tone="up"` | `bg-teal-500/15 text-teal-400` | `bg-teal-500/15 text-teal-600` | New items velocity, resolution gains (`+18%`) |
| **Negative / Down** | `tone="down"` | `bg-red-500/15 text-red-500` | `bg-red-500/15 text-red-600` | Delays, urgent escalation warnings (`-5%`, `Action`) |

---

### 2.5 Chart & Data Visualization Palette

Recharts components (Donut Chart, Area Chart, Teams Workload Chart, and Horizontal Priority Meters) consume an authoritative token palette:

| Key | Color Name | CSS Variable | Hex Equivalent | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--chart-1` | Vibrant Teal | `175 84% 32%` | `#14b8a6` | Open items metric / primary series line |
| `--chart-2` | Warm Orange | `18 92% 50%` | `#f97316` | In-progress volume / secondary area fill |
| `--chart-3` | Muted Cream | `11 25% 91%` | `#efe6e4` | Awaiting approval / highlights |
| `--chart-4` | Slate Neutral | `0 3% 22%` | `#383636` | Closed items / chart background tracks |
| `--chart-5` | Electric Blue | `217 91% 60%` | `#3b82f6` | Informational segments / total items |

---

## 3. Typography System

The typography stack is driven by `Geist Variable` (`@fontsource-variable/geist`) as the primary sans font, with `Inter` and system sans-serif fonts as robust fallbacks.

```css
fontFamily: {
  sans: ["'Geist Variable'", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
  heading: ["'Geist Variable'", "Inter", "sans-serif"],
}
```

### Type Hierarchy & Scale

| Style / Level | Tailwind Classes | Size / Line-Height | Weight | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Live Clock** | `text-3xl tracking-tight tabular-nums` | `1.875rem (30px)` | Semibold (600) | Live header digital clock |
| **KPI Stat Value** | `text-2xl sm:text-3xl font-semibold tracking-tight` | `1.5rem - 1.875rem` | Semibold (600) | Metric count numbers in summary cards |
| **Brand Wordmark** | `text-xl font-semibold tracking-tight` | `1.25rem (20px)` | Semibold (600) | "OpsDesk." sidebar brand header |
| **Page Title** | `text-xl font-semibold leading-tight` | `1.25rem (20px)` | Semibold (600) | Work item detail and modal titles |
| **Card Title** | `text-lg font-medium` or `font-heading text-base font-medium` | `1.125rem / 1rem` | Medium (500) | Section and card headers |
| **Card Subtitle** | `text-sm text-muted-foreground` | `0.875rem (14px)` | Normal (400) | Explanatory subheads below card titles |
| **Body / Table Cell** | `text-sm font-normal` | `0.875rem (14px)` | Normal (400) | Work item titles, descriptions, table data |
| **Nav Section Label** | `text-[0.8125rem] font-medium text-muted-foreground` | `0.8125rem (13px)` | Medium (500) | "DASHBOARD", "MY TEAMS" groupings |
| **Badges / Chips** | `text-xs font-medium` | `0.75rem (12px)` | Medium (500) | Status pills, priority tags, count badges |
| **Avatar Monogram** | `text-[11px] font-medium` | `0.6875rem (11px)` | Medium (500) | User avatar fallback initials |

> [!NOTE]
> All timestamps, clock counters, and numeric delta values enforce `tabular-nums` to prevent horizontal jitter during real-time re-renders.

---

## 4. Spacing, Sizing & Layout Geometry

OpsDesk follows a strict 4px / 8px incremental modular spacing scale combined with custom layout container tokens:

### 4.1 Layout Frame Dimensions

- **Sidebar Width (`--sidebar-width`)**: `20rem` (`320px`). Fixed on desktop displays (>= 1024px) with a collapsible state toggle; transforms into an off-canvas drawer (`MobileDrawer`) below 1024px.
- **Header Height (`--header-height`)**: `4.25rem` (`68px`). Fixed sticky top bar with backdrop blur (`backdrop-blur bg-background/80`) and 1px bottom border.
- **Card Internal Padding**: Standard `p-4` (16px) or `p-6` (24px) according to density needs.
- **Grid Gutters**: Uniform `gap-6` (24px) for all primary multi-column dashboard layouts.

### 4.2 Corner Radii Tokens

- `--radius-sm`: `0.375rem` (`6px`) — Micro chips, sub-pill counters.
- `--radius-md`: `0.5rem` (`8px`) — Buttons, form inputs, navigation items.
- `--radius-lg` (`--radius`): `0.75rem` (`12px`) — Primary cards, modals, dialog surfaces.
- `--radius-full`: `9999px` — Circular avatars, icon circles, notification indicator badges.

### 4.3 Standard Card Utility Definition

All dashboard cards derive from a single unified style definition defined in `constants.js`:

```javascript
export const CARD = 'gap-0 rounded-xl border border-border bg-card py-0 shadow-none ring-0';
```

---

## 5. Component Library & Architectural Patterns

OpsDesk UI components are built using React 19, Radix UI primitives, Lucide React icons, and class-variance-authority (`cva`).

### 5.1 Component Inventory

```
client/src/components/
├── auth/
│   └── ProtectedRoute.jsx          # Route guard based on auth token
├── charts/
│   ├── AreaChart.jsx               # SVG sparkline & gradient area series
│   ├── Donut.jsx                   # Recharts pie breakdown with center readout
│   ├── HeroIllustration.jsx        # Custom SVG operations desk artwork
│   └── StatusBarChart.jsx          # Multi-state bar chart breakdown
├── dashboard/
│   ├── AllTeamsOverview.jsx        # Global multi-team executive dashboard
│   ├── LiveClockCard.jsx           # Localized clock, greeting, day progress bar
│   ├── TeamsWorkloadChart.jsx      # Organization-wide multi-team workload bars
│   ├── StatusMixCard.jsx           # Donut chart card showing status breakdown
│   ├── NewItemsCard.jsx            # 7-day velocity chart & delta card
│   ├── PriorityMixCard.jsx         # Severity volume breakdown meters
│   ├── NeedsAttentionCard.jsx      # Urgent triage item watchlist
│   ├── TeamCard.jsx                # Interactive team summary card with status bar
│   ├── TeamBanner.jsx              # Single-team view header with team metadata
│   ├── OperationsCard.jsx          # Team operations summary KPI card
│   ├── ApprovalCard.jsx            # Lead/Admin approval workflow queue card
│   ├── TotalItemsCard.jsx          # Total items count & breakdown card
│   ├── StatusOverviewCard.jsx      # Interactive status filter & chart module
│   ├── WorkloadCard.jsx            # Member assignment workload breakdown
│   ├── RecentActivityCard.jsx      # Real-time append-only activity audit stream
│   ├── WorkItemsCard.jsx           # Filterable, paginated data table
│   ├── TeamMembersCard.jsx         # Team roster card with role badges
│   └── UsersView.jsx               # Team user directory & member administration
├── dialogs/
│   ├── CreateItemDialog.jsx        # Modal for creating new work items
│   └── EditItemDialog.jsx          # Modal with OCC version check & status mutations
├── layout/
│   ├── Header.jsx                  # Top navigation, global search, theme/notification triggers
│   ├── SideBar.jsx                 # Collapsible desktop navigation container
│   ├── SidebarContent.jsx          # Navigation tree, team switcher, user profile card
│   ├── MobileDrawer.jsx            # Responsive slide-over drawer for mobile devices
│   ├── NavItem.jsx                 # Navigation list item with active accent indicator
│   └── NavLabel.jsx                # Uppercase section category header
├── shared/
│   ├── Chip.jsx                    # Trend delta chip (+100%, -5%, Action)
│   ├── IconCircle.jsx              # Standardized 44px round icon container
│   ├── PriorityBadge.jsx           # Severity badge mapping
│   ├── StatusBadge.jsx             # Operational status badge mapping
│   └── UserAvatar.jsx              # Initials monogram fallback avatar
└── ui/
    ├── button.jsx                  # Polymorphic Radix button with CVA variants
    ├── card.jsx                    # Compound Card components (Header, Title, Content, Footer)
    ├── badge.jsx                   # Pill badge with CVA variants
    ├── dialog.jsx                  # Accessible Radix modal dialog
    ├── input.jsx                   # Styled form input control
    ├── textarea.jsx                # Multi-line text field control
    ├── select.jsx                  # Radix Select dropdown
    ├── tabs.jsx                    # Radix segmented tab switcher
    ├── table.jsx                   # Semantic table primitives
    ├── skeleton.jsx                # Animated pulse skeleton loader
    ├── avatar.jsx                  # Radix Avatar primitive
    └── Loader.jsx                  # Full-page and inline spinner components
```

---

### 5.2 Component Anatomy & Specifications

#### 1. Buttons (`Button`)
- **Base styles**: `inline-flex shrink-0 items-center justify-center rounded-lg border text-sm font-medium transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:opacity-50`
- **Variants**:
  - `default`: Warm Cream primary (`bg-primary text-primary-foreground hover:bg-primary/80`).
  - `outline`: Neutral bordered (`border-border bg-background hover:bg-muted text-foreground`).
  - `secondary`: Subdued background (`bg-secondary text-secondary-foreground`).
  - `ghost`: Transparent hover (`hover:bg-muted hover:text-foreground`).
  - `destructive`: Red tint alert action (`bg-destructive/10 text-destructive hover:bg-destructive/20`).
- **Sizes**: `xs` (24px), `sm` (28px), `default` (32px), `lg` (36px), `icon` (32x32px square).

#### 2. Status & Priority Badges (`StatusBadge`, `PriorityBadge`)
- **Geometry**: Compact height `h-5`, rounded pill shape (`rounded-4xl`), subtle translucent background (`10% alpha`), matching border stroke (`20% alpha`), font weight `font-medium`.
- **Labels**: Automatic humanization of PascalCase enum identifiers (e.g., `AwaitingApproval` -> `Awaiting Approval`).

#### 3. Metric Containers (`OrgStat`, `OperationsCard`, `TotalItemsCard`)
- **Structure**: Two-column layout inside `CardContent`:
  - Left column: Metric label (`text-sm font-medium text-muted-foreground`), large count (`text-2xl font-semibold tracking-tight`), inline `Chip` trend pill.
  - Right column: `IconCircle` (`size-9` or `size-11` round border container with Lucide icon).

#### 4. Stacked Multi-Segment Progress Bars (`TeamsWorkloadChart`, `TeamCard`)
- Visual distribution of team workload showing proportional segments of `Open` (sky), `InProgress` (amber), `AwaitingApproval` (violet), and `Closed` (slate) with rounded ends and hover tooltips.

#### 5. User Avatars (`UserAvatar`)
- Monogram circle derived from user name or email (e.g., "Rahul Sharma" -> "RS", "test@example.com" -> "TE").
- Sized at `size-8` (32px) for table rows and comments, `size-9` (36px) for header, and `size-14` (56px) for sidebar profile footer.

---

## 6. Interaction, Motion & Accessibility

### 6.1 Interactive States

- **Hover Feedback**: Interactive list items, table rows, and secondary buttons shift smoothly via `transition-colors hover:bg-accent`.
- **Active Tactile Press**: Buttons apply `active:translate-y-px` to create physical tactile feedback when clicked.
- **Focus Ring**: Enforces `focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-2` with `outline-offset-2` to guarantee high-contrast keyboard navigation compliance.
- **Disabled State**: Non-interactive or pending controls receive `disabled:pointer-events-none disabled:opacity-50`.

### 6.2 Skeleton Loading States

To eliminate layout shifts (CLS) while remote RTK Query endpoints resolve, all cards support dedicated `<Skeleton />` wireframe mocks matching exact component dimensions:
- Metric cards pulse miniature rectangle skeletons (`h-7 w-12`, `h-5 w-16`).
- Tables render placeholder rows with matching column count and rounded pill placeholders.

### 6.3 Responsive Breakpoints

| Breakpoint | Width Range | Layout Behavior |
| :--- | :--- | :--- |
| **Mobile (`< 640px`)** | `0 - 639px` | Single-column stack, mobile drawer navigation, condensed tables |
| **Tablet (`sm` to `lg`)** | `640px - 1023px` | 2-column card grids, horizontal scrolling table tabs, drawer toggle |
| **Desktop (`lg`)** | `1024px - 1279px` | 3-column / 4-column dashboard layout, fixed collapsible 320px sidebar |
| **Wide Display (`xl`+)** | `>= 1280px` | Full multi-column analytical dashboard with expanded side-by-side tables |

---

## 7. Design-to-Code Implementation Guidelines

1. **Strict Token Adherence**: Never use arbitrary hardcoded hex codes in component class lists. Always reference semantic classes (`text-muted-foreground`, `border-border`, `bg-card`) or tokens defined in `theme.css`.
2. **Unified Card Construction**: Always utilize the `CARD` string from `@/lib/constants` for container wrappers to ensure visual consistency across all view modules.
3. **Optimistic UI Feedback**: When mutating work items or comments, reflect the local state immediately while displaying non-blocking progress spinners.
4. **Role-Driven UI Gating**: Display permission-specific actions (such as the `New item` button or approval actions) only when user role permits (`Member`, `Lead`, `Admin`), while preserving read-only visibility for Viewers.
