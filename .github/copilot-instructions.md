# Khatabook PWA - Copilot Instructions

## Project Overview
Khatabook is a **Progressive Web App (PWA) for ERP/accounting management** built with React 19, Vite, and Firebase. It manages customers, ledgers, and transactions with **role-based access control** (admin, subadmin, user).

## Architecture & Key Patterns

### 1. **Routing & Guards System**
**Files:** `src/core/router/AppRouter.jsx`, `routes.registry.js`, `guards.jsx`, `layouts.jsx`, `RequireAuth.jsx`

- **Route registration:** Each feature (`auth`, `customers`, `dashboard`, `ledger`) exports `*Routes` arrays that are aggregated in `routes.registry.js`
- **Guard pattern:** Routes declare `meta: { guard: 'auth' }` → `applyGuards()` wraps them with `<RequireAuth>` component
- **Layout pattern:** Routes declare `meta: { layout: 'auth' }` for login pages (no sidebar), otherwise wrapped with `<Layout>`
- **Auth wrapper enforces:** Must be logged in + role must be admin/subadmin (role check in `RequireAuth.jsx`)
- **Add new routes:** Create `feature.routes.jsx` with route definitions, export array, add to `routes.registry.js`

**Example:**
```jsx
// pages/customers/customers.routes.jsx
export const customersRoutes = [
  {
    path: "/customers",
    element: <CustomersPage />,
    meta: { guard: "auth" },  // Protected by RequireAuth
  }
];
```

### 2. **Authentication & Role-Based Access**
**Files:** `src/hooks/useAuth.js`, `src/firebase/auth.service.js`, `src/firebase/firebase.js`

- **Auth state:** `useAuth()` hook provides `{ user, role, loading }` from Firebase ID token claims
- **Role hierarchy:** "admin" → "subadmin" → "user" (determined server-side via Firebase custom claims)
- **useAuth pattern:** Listen to `onAuthStateChanged()` and extract `tokenResult.claims.role`
- **Data filtering is role-aware:** Services like `listenCustomers()` accept role parameter and query differently
  - Admin/subadmin: See all customers
  - Normal user: See only their own customers (filtered by `uid`)
- **For new features:** Always pass `role` to service queries and filter accordingly

### 3. **Firebase Service Layer**
**Files:** `src/firebase/*.service.js` (customer, transaction, auth, etc.)

- **Firestore-first:** Use Firestore collections (customers, transactions, ledgers)
- **Real-time listeners:** Services export `listen*()` functions using `onSnapshot()` for reactive updates
- **Patterns:**
  - `listen*()` → returns unsubscribe function (cleanup in useEffect)
  - `add*()`, `update*()`, `delete*()` → async operations with error handling
  - All writes include `uid` field to track ownership
- **Timestamps:** Use `serverTimestamp()` for consistent server-side time
- **Query patterns:** Build queries with `where()` clauses before `onSnapshot()` to filter server-side

**Example:**
```javascript
// In service
export const listenCustomers = (callback, role) => {
  const q = role === "admin" 
    ? query(collection(db, "customers"))
    : query(collection(db, "customers"), where("uid", "==", auth.currentUser.uid));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => d.data())));
};

// In hook
const unsubscribe = listenCustomersService((data) => setCustomers(data), role);
```

### 4. **Custom Hooks Pattern**
**Files:** `src/hooks/use*.js` (useCustomers, useLedger, useTransactions, useAuth)

- **Responsibility:** Manage state + call service layer functions
- **Standard structure:**
  - State for data, loading, error
  - `useEffect()` for real-time listeners (unsubscribe on cleanup)
  - `useCallback()` for action functions (add, update, delete)
  - Return object with data + actions
- **All hooks are role-aware:** Pass `role` from `useAuth()` to service functions

### 5. **UI Components**
**Files:** `src/components/Layout.jsx`, `src/components/Header.jsx`, `src/components/Footer.jsx`

- **MUI-based:** Uses Material-UI v7 (`@mui/material`) with emotion styling
- **Layout wrapping:** `<Layout>` provides sidebar navigation and footer (auth routes excluded)
- **Component location:** Page-level components in `src/pages/`, reusable in `src/components/`

### 6. **Build & Development**

**Commands:**
- `npm run dev` - Start Vite dev server (HMR enabled)
- `npm run build` - Production build (PWA service worker generated)
- `npm run lint` - ESLint check
- `npm run preview` - Preview production build

**PWA Configuration:** `vite.config.js` uses `vite-plugin-pwa`
- Auto-generates service worker for offline capability
- `navigateFallback: '/index.html'` for SPA routing
- Icons & manifest in public folder

## Project-Specific Conventions

1. **File naming:** Feature folders use kebab-case (e.g., `add-customer-page.jsx`), exported with camelCase
2. **Service layer separation:** All Firebase calls in `src/firebase/`, never directly in components
3. **Hook-first pattern:** Components fetch data via custom hooks, not directly via context
4. **Error handling:** Services throw errors, hooks handle with state, components display error UI
5. **Comments:** Important patterns marked with 🔥, 👤, ⏳, 🔒 emojis in code

## Key Integration Points

- **Firebase auth:** `onAuthStateChanged()` in `useAuth()` → custom claims from backend set via `setRole.js`
- **RxDB:** Listed in dependencies but currently unused (may be for offline sync in future)
- **Router:** All routes flow through `AppRouter` → guard/layout system
- **Styling:** MUI theme + emotion (check `src/core/theme/theme.js` if custom theme exists)

## When Adding Features

1. Create feature folder in `src/pages/FeatureName/`
2. Add service file in `src/firebase/feature.service.js` (with real-time listener pattern)
3. Create custom hook in `src/hooks/useFeature.js` (manage state + call service)
4. Create route file `feature.routes.jsx` with `meta: { guard: 'auth' }` if protected
5. Add routes to `routes.registry.js`
6. Build pages/components with MUI
7. Pass `role` to service layer for data filtering if needed
