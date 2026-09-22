# HRIS UI/UX Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the HRIS module UI/UX to be more elegant and professional by sharpening border radii, fixing popup background transparency (blur conflicts), and applying a "less borders, more whitespace" design principle for complex data views.

**Architecture:** This is a UI-layer refactoring utilizing Tailwind CSS and shadcn-vue components. We are adjusting global CSS variables, overriding shadcn component defaults for Dialogs, and cleaning up the composition of existing HRIS Views (EmployeeDetailView and EmployeeListView).

**Tech Stack:** Vue 3, Tailwind CSS, shadcn-vue (Radix UI)

**Spec:** Defined in chat context. Key decisions: 
1. `rounded-sm` (subtle corners) instead of `rounded-lg`.
2. Dialogs use solid dark overlay (no blur) and opaque content.
3. Complex data (Employee Detail) uses a large centered Dialog with Tabs.
4. "Clean & Borderless" approach for lists and cards.

## Global Constraints

- Must not break any existing functionality or API calls in the HRIS module.
- Stick to the existing Tailwind utility classes; avoid writing custom CSS outside of root variables.
- Preserve Dark Mode / Light Mode compatibility (rely on `bg-background`, `bg-muted`, etc).

---

### Task 1: Sharpen Global Border Radius

**Files:**
- Modify: `src/assets/css/index.css`

**Interfaces:**
- Consumes: Existing CSS variables setup.
- Produces: A sharper UI globally.

- [ ] **Step 1: Update the `--radius` variable in CSS**
Modify `src/assets/css/index.css` to change the base radius from its current value (likely `0.5rem`) to `0.3rem`.

```css
  :root {
    /* ... existing variables ... */
    /* Add or update the radius variable */
    --radius: 0.3rem;
  }
```

- [ ] **Step 2: Commit**
```bash
git add src/assets/css/index.css
git commit -m "style: sharpen global border radius for elegant look"
```

---

### Task 2: Fix Dialog Overlay & Content (Anti-Bentrok)

**Files:**
- Modify: `src/components/ui/dialog/DialogOverlay.vue`
- Modify: `src/components/ui/dialog/DialogContent.vue`

**Interfaces:**
- Consumes: shadcn-vue Dialog components.
- Produces: Solid, non-conflicting dialog popups.

- [ ] **Step 1: Modify DialogOverlay**
Change the Tailwind classes in `DialogOverlay.vue` to remove `backdrop-blur-sm` (if exists) and ensure the background is a solid dark color with correct opacity (e.g., `bg-black/80` or `bg-black/60`).

```vue
<!-- Change from something like bg-black/50 backdrop-blur-sm -->
<DialogOverlay
  :class="
    cn(
      'fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      props.class
    )
  "
/>
```

- [ ] **Step 2: Modify DialogContent**
Ensure `DialogContent.vue` is completely opaque (`bg-background`) and add a sharper shadow (`shadow-xl`) and a subtle border (`border border-border`).

```vue
<DialogContent
  :class="
    cn(
      'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-background p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
      props.class
    )
  "
>
```

- [ ] **Step 3: Commit**
```bash
git add src/components/ui/dialog/DialogOverlay.vue src/components/ui/dialog/DialogContent.vue
git commit -m "style: fix dialog transparency and shadow for better focus"
```

---

### Task 3: Refactor EmployeeDetailView (Large Tabbed Dialog)

**Files:**
- Modify: `src/modules/HRIS/views/EmployeeDetailView.vue`

**Interfaces:**
- Consumes: Refactored Dialog component.
- Produces: A clean, large, tabbed interface for complex employee data.

- [ ] **Step 1: Widen the Dialog and clean up layout**
Modify the `<DialogContent>` wrapper in `EmployeeDetailView.vue` to be wider (`max-w-4xl` or `max-w-5xl`). Ensure Tabs take full width.

```vue
<!-- Ensure DialogContent has max-w-5xl and h-[85vh] for scrolling if needed -->
<DialogContent class="max-w-5xl h-[85vh] flex flex-col overflow-hidden p-0">
  <DialogHeader class="px-6 py-4 border-b border-border">
    <DialogTitle>Employee Detail</DialogTitle>
    <!-- ... -->
  </DialogHeader>
  
  <!-- Content Area (Scrollable) -->
  <div class="flex-1 overflow-y-auto px-6 py-4">
    <Tabs defaultValue="basicInfo" class="w-full">
      <!-- ... existing tabs list ... -->
      <!-- Ensure the content inside tabs uses "Clean" styling (muted labels, solid values, no heavy card borders) -->
    </Tabs>
  </div>
</DialogContent>
```

- [ ] **Step 2: Apply "Less Borders" to Data Display**
Inside the tab contents (e.g., `EmployeeBasicInfoTab.vue` or inline code), remove heavy borders around sections. Use subtle background colors (`bg-muted/50`) or simple flex layouts to separate data pairs.
*Label styling:* `text-sm text-muted-foreground`
*Value styling:* `text-sm font-medium text-foreground`

- [ ] **Step 3: Commit**
```bash
git add src/modules/HRIS/views/EmployeeDetailView.vue
git commit -m "refactor: apply large tabbed dialog and clean layout for employee details"
```

---

### Task 4: Refactor EmployeeListView (Borderless Tables)

**Files:**
- Modify: `src/modules/HRIS/views/EmployeeListView.vue`

**Interfaces:**
- Consumes: Existing table components.
- Produces: A cleaner list view.

- [ ] **Step 1: Remove outer table borders**
In `EmployeeListView.vue`, find the container wrapping the `Table` or `Card` and remove outer borders. Use simple horizontal dividers (`border-b`) between rows instead of full grids.

```vue
<!-- Change outer container to be borderless, maybe just a subtle shadow or flat background -->
<div class="bg-background rounded-md border-none shadow-sm">
  <Table>
    <!-- Keep TableHeader border-b -->
    <!-- Keep TableRow border-b border-border/50 -->
  </Table>
</div>
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/HRIS/views/EmployeeListView.vue
git commit -m "style: apply borderless table design to employee list"
```