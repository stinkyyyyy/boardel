## 2026-02-11 - Semantic Elements simplify Accessibility

**Learning:** Converting custom `div` dropdown items to `button` elements automatically provides correct role and keyboard activation, reducing the need for custom JS event handlers for Enter/Space keys.
**Action:** Always prefer native semantic elements over ARIA-fied `div`s when refactoring UI components.

## 2026-02-12 - Tooltip Accessibility Gaps
**Learning:** Tooltips implemented with CSS `:hover` only are inaccessible to keyboard users. This pattern was found in `src/styles/tooltips.css`.
**Action:** When creating or modifying tooltips, always include `:focus-within` or `:focus` alongside `:hover` to ensure keyboard accessibility.
