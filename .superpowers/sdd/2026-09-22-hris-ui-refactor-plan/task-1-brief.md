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