# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js on port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

Requires a backend API running at `http://localhost:3001` (configured via `NEXT_PUBLIC_API_URL` in `.env.local`).

## Architecture

ZenCash is a **frontend-only** Next.js 16 (App Router) financial management app in TypeScript. It communicates with an external REST API for all data. The UI is in Brazilian Portuguese.

### Key layers

- **`app/lib/`** — API client and service modules. `api.ts` creates an Axios instance with auth interceptors (adds Bearer token, handles 401 redirects). Other files (`auth.ts`, `transactions.ts`, `categories.ts`, `dashboard.ts`) wrap specific API endpoints. `auth-guard.tsx` is a client component that redirects unauthenticated users to `/login`.
- **`app/shared-theme/`** — MUI theme configuration with dark/light mode support. `AppTheme.tsx` is the provider; `themePrimitives.ts` defines colors/typography; `customizations/` overrides MUI component styles.
- **`app/components/`** — Shared components: `ToastProvider` (context-based toast notifications via `useToast` hook), `MonthYearPicker`, `CoinLogo`.
- **Route pages** — Each route (`dashboard/`, `transactions/`, `categories/`, `import/`, `profile/`, `login/`, `register/`) has its own `page.tsx` and colocated components. Protected routes wrap content with `AuthGuard`.

### Auth

JWT token stored in `localStorage` as `zencash_token`. The Axios interceptor in `app/lib/api.ts` attaches it to all requests. 401 responses trigger automatic redirect to `/login`.

### Data fetching pattern

Components fetch data directly with Axios via service functions in `app/lib/`. State is managed locally with `useState`/`useEffect`. The dashboard uses `Promise.allSettled()` for parallel fetches. No global state library.

### UI stack

MUI v7 components throughout (DataGrid, Charts, DatePickers, form controls). Styling uses MUI `sx` prop. Tailwind CSS is installed but minimally used. Path alias: `@/*` maps to project root.
