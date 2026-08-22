## 2026-08-22 - Lazy Search Indexing & String Allocation Avoidance in Real-Time Search

**Learning:** Unconditional index computation in persistent components (e.g., search bars rendered globally) forces unnecessary synchronous storage parsing and object creation on every state update even when the UI modal is closed. Additionally, calling `.toLowerCase()` on string arrays inside inner search scoring loops creates thousands of transient string allocations per keystroke.

**Action:** Gate global search catalog indexing on the modal's `isOpen` state and pre-normalize searchable keywords during catalog construction to keep token matching allocation-free.
