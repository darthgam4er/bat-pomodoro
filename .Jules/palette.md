## 2024-02-14 - Accessibility Pattern in Icon Buttons
**Learning:** This application makes heavy use of icon-only buttons for key actions (task management, window controls) without accessible names.
**Action:** Consistently audit all `button` elements that only contain an `svg` or `Icon` component. If no text is present, `aria-label` must be added. Dynamic states (like task completion) need dynamic labels.
