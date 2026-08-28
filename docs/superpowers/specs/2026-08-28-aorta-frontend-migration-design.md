# Aorta Frontend UI Decoupling Spec

## Objective
Migrate the UI layer of the Aorta Hospital OS from a Laravel/Inertia.js architecture to a standalone Vue 3 + TypeScript SPA architecture, powered by an ASP.NET backend. The UI output (Tailwind v4, Shadcn-vue, animations) must remain 100% visually identical to the original, while adapting all data communication and state management to pure Vue standards (Vue Router, Pinia, Axios).

## Architecture Changes
*   **Routing:** Inertia.js `<Link>` components will be globally replaced with Vue Router `<RouterLink>` components.
*   **Layouts:** Nested component layouts used in Inertia will be refactored into Vue Router-compatible layout components (`src/layouts/`), leveraging `<RouterView>`.
*   **State Management:** Inertia's `usePage().props` (used for user data, modules, permissions) will be entirely replaced by Pinia's `useAuthStore`. UI components will reactively consume `authStore.user`, `authStore.roles`, etc.
*   **Form Handling:** Inertia's `useForm` will be refactored into Vue `reactive()` state combined with standard `async/await` Axios calls. Loading states will use local `ref(false)`. Error handling will catch Axios interceptor errors and map them to standard UI error indicators.

## Components and Styling (1:1 Copy)
*   **CSS & Theming:** Copy `app.css` directly to preserve Tailwind v4 `@theme inline` variables and global CSS layers.
*   **UI Primitives:** Recreate or copy the Shadcn-vue components exactly into `src/components/ui/` to maintain the strict visual identity (high-contrast dark mode, clean flat light mode).
*   **Animations:** Preserve usage of `tw-animate-css` utility classes (e.g., `animate-in fade-in`).

## Target Milestones
1.  **Foundation:** Porting `app.css`, setting up the Tailwind v4 base, and ensuring Shadcn UI primitives are installed or copied.
2.  **Layout Conversion:** Creating `AuthSimpleLayout.vue`, `AppSidebarLayout.vue`, and other shell containers compatible with `<RouterView>`.
3.  **Entry Pages Migration:** 
    *   Porting `Welcome.vue` (Landing page).
    *   Porting `LoginView.vue` (Refactoring form logic to use `useAuthStore.login()`).
    *   Porting `Portal.vue` (Module selector, adapting greeting logic and reading modules from Pinia).
4.  **Core App UI:** Porting the Sidebar (`AppSidebar.vue`), user navigation (`NavUser.vue`), and adapting `v-if="hasPermission(...)"` to utilize Pinia.

## Trade-offs and Constraints
*   **Refactoring over Adapter:** Opting to fully refactor forms to Vue/Axios standard rather than creating an Inertia adapter. This improves long-term maintainability and performance (crucial for future desktop packaging) at the cost of requiring manual adjustment to every form component's `<script setup>`.