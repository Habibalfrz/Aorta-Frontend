# AORTA Frontend - Project Context & Architecture Overview

## 1. Project Vision & Overview
**AORTA** is a modern Single Page Application (SPA) designed as an integrated **"App Hub"** (similar to Google Workspace or Odoo). The application serves multiple enterprise functions through unified access. 

The primary entry point post-login is the **Employee Self Service (ESS) Portal**, where employees manage their attendance, leaves, and profile. From there, users with specific privileges (Roles) can access other modules like **HRIS** (for HR Managers) and **SysAdmin** (for Superadmins) using a global "App Switcher" (9-dots grid menu).

## 2. Technology Stack
*   **Core**: Vue 3 (Composition API, `<script setup>`), TypeScript, Vite.
*   **Routing**: Vue Router 4.
*   **State Management**: Pinia.
*   **Styling & UI**: Tailwind CSS, shadcn-vue (Radix Vue headless UI + Tailwind), Lucide Icons (`lucide-vue-next`).
*   **HTTP Client**: Axios.
*   **Auth Utility**: `jwt-decode` (for extracting .NET backend JWT claims).

## 3. Architecture & Folder Structure
The project uses a **Modular / Feature-Sliced Design**, separating logic by business domains rather than purely by technical types.

```text
src/
├── api/            # Axios instance and modular API calls (e.g., ess.ts, hris.ts)
├── assets/         # Static assets (images, global CSS)
├── components/
│   └── ui/         # Reusable shadcn-vue primitive components (buttons, dialogs, etc.)
├── layouts/        # Application layouts holding structural UI and navigation
│   ├── AuthLayout.vue
│   ├── EssLayout.vue      # Contains the App Switcher and User Profile dropdown
│   ├── HrisLayout.vue
│   └── SysAdminLayout.vue
├── modules/        # Domain-driven feature modules
│   ├── Auth/       # Login logic and views
│   ├── Dashboard/  # ESS Dashboard (Attendance, Leave balance)
│   ├── ESS/        # Employee Self Service specific views
│   ├── HRIS/       # HR Management views (Employees, Shifts, Leaves, Payroll)
│   ├── SysAdmin/   # System monitoring, health, roles, and logs
│   └── Public/     # Landing pages (Guest)
├── router/         # Vue Router configuration and Navigation Guards
└── store/          # Pinia stores (auth.ts)
```

## 4. Core Logic & Implementation

### A. Authentication & State Management (`src/store/auth.ts`)
*   **JWT Storage**: Tokens are stored in Pinia state and persisted in `LocalStorage` (`access_token`).
*   **Decoding & Claims**: The app intercepts JWTs and decodes them to extract standardized `.NET` claims (`ROLE_CLAIM`, `NAMEID_CLAIM`, etc.) and custom claims (`modules`, `permissions`).
*   **Role-Based Access Control (RBAC)**: Exposes `hasRole(role)` and `hasPermission(permission)` getters to conditionally render UI components (like the App Switcher buttons).

### B. Routing & Navigation Guards (`src/router/index.ts`)
*   **Global Guard**: Intercepts every route to check `authStore.isAuthenticated`.
*   **Landing Logic**: `determineLandingRoute()` directs `"Superadmin"` solely to `/admin-portal` and all other multi-role/regular users to `/ess`.
*   **Pending Security**: Currently, guards only check authentication status (`requiresAuth: true`). Role-based route protection (preventing URL guessing for `/hris` or `/admin-portal`) is pending implementation via route `meta` attributes.

### C. The "App Hub" Concept (App Switcher)
*   Located in `src/layouts/EssLayout.vue`.
*   Uses a `Popover` component from shadcn-vue to display a grid of accessible modules.
*   The "ESS Portal" is universally visible. "SysAdmin" requires `hasRole('Superadmin')`. "HRIS" requires `hasRole('HR_Manager')`.

### D. API Integration (`src/api/`)
*   Centralized Axios configuration (`axios.ts`), presumably with request/response interceptors for attaching Bearer tokens and handling 401s.
*   Domain-specific API files (e.g., `ess.ts` defines `fetchEssSummary` which returns strongly-typed data `EssSummary` for the ESS Dashboard).

## 5. Current Development Status
*   **✅ Completed**: Login flow, JWT parsing, Pinia auth state, Layout structures, Modular folder separation, ESS Dashboard layout with real API integration and Skeleton loading states.
*   **🚧 Work In Progress / Stubs**: HRIS and SysAdmin routes are currently pointing to dummy fallback components (`EmployeeListView.vue`, `SystemMonitorView.vue`).
*   **❌ Missing**: Advanced shadcn-vue components required for HRIS (DatePicker/Calendar, Command/Combobox, Checkbox/DataTable implementations), API POST mutations for ESS (Clock In/Out), and Role-based navigation guards in the router.

## 6. Important Dependencies (Packages)
Key packages installed driving the architecture:
*   `vue`, `vue-router`, `pinia` (Vue Ecosystem)
*   `axios` (API requests)
*   `jwt-decode` (Token parsing)
*   `tailwindcss`, `autoprefixer`, `postcss` (Styling engine)
*   `clsx`, `tailwind-merge`, `class-variance-authority` (Tailwind class utilities for shadcn-vue)
*   `@radix-ui/vue-*` (Headless accessible UI components backing shadcn-vue)
*   `lucide-vue-next` (Standardized iconography)

---
*Note for AI Agents: When working on this codebase, prioritize keeping code modular inside `src/modules/`, use shadcn-vue primitives from `src/components/ui/`, and rely on `useAuthStore` for any RBAC rendering logic.*