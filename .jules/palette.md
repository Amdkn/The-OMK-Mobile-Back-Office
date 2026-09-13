## 2025-09-13 - Modal Accessibility standardizations
**Learning:** Confirmation modals throughout the system were missing appropriate dialog roles (`role="dialog"`, `aria-modal="true"`) and focus ring states for keyboard users (`focus-visible:ring-2`).
**Action:** Always provide dialog landmarks (`aria-labelledby`, `aria-describedby`), explicit `aria-label` on dismiss buttons, hide decorative icons with `aria-hidden="true"`, and apply clear focus visible rings to action controls.
