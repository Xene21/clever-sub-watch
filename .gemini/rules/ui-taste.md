# UI Taste & Design Engineering Guidelines (Emil Kowalski Style)

When designing or writing UI components for this project, adhere strictly to the following high-craft design engineering principles:

---

## 1. Micro-Interactions & Motion Physics
- **Spring Animations over Easing**: Prefer spring physics using `framer-motion` over linear/cubic-bezier CSS transitions.
  ```tsx
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
  ```
- **Tactile Feedback**:
  - Interactive cards & buttons should respond to user intent:
    - Hover: `whileHover={{ scale: 1.015, y: -2 }}`
    - Active / Tap: `whileTap={{ scale: 0.985 }}`
- **Layout Animations**:
  - Use `layout` or `layoutId` for tabs, filtering lists, accordion collapses, and modal transitions to ensure smooth spatial continuity.
- **AnimatePresence**: Always wrap conditionally rendered elements (dialogs, toasts, inline alerts, dropdowns) in `<AnimatePresence>` with subtle `opacity`, `scale`, or `y` translation.

---

## 2. Typography & Tabular Data
- **Financial & Numeric Precision**:
  - Always use `font-mono tabular-nums` for currency values, dates, percentages, and counters so numbers don't jitter when updating.
- **Hierarchy & Contrast**:
  - Distinguish primary headers (`font-display font-semibold tracking-tight text-foreground`) from secondary copy (`text-muted-foreground text-sm`).
  - Use subtle uppercase labels (`text-[10px] font-medium tracking-wider uppercase text-muted-foreground/70`) for category metadata.

---

## 3. Visual Depth & Surface Design
- **Subtle 1px Borders**:
  - Prefer semi-transparent, crisp 1px borders (`border border-white/10` or `border-border/60`) over heavy drop shadows.
- **Glassmorphism & Layering**:
  - Use subtle backdrop blurs (`backdrop-blur-md bg-background/80` or `glass-card`) for floating elements, stickies, headers, and modals.
- **Hover & Focus Ring Precision**:
  - Focus rings should be clean and offset (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`).
  - Hover states should feel organic, using background opacity shifts (`hover:bg-muted/50`).

---

## 4. Complete State Handling (Zero Edge-Case UI)
Every UI view or component MUST handle all 4 core states gracefully:
1. **Loading State**: Use skeleton loaders (`<Skeleton />`) matching exact layout shapes, not just centered spinners.
2. **Empty State**: Provide clear, delightful illustrations/icons with actionable primary buttons when lists or data are empty.
3. **Error State**: Non-intrusive inline alerts with retry mechanisms.
4. **Success / Interaction State**: Provide instant visual feedback (toast via `sonner`, button state changes).

---

## 5. Accessibility & Polish
- Keyboard navigable (`asChild`, correct ARIA attributes via Radix UI / Shadcn).
- Truncate long strings with `truncate` or `line-clamp-2` with `title` attributes for tooltips.
- Prevent layout shift (CLS) by reserving container heights during async loads.
