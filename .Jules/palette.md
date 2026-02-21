## 2026-02-11 - Semantic Elements simplify Accessibility
**Learning:** Converting custom `div` dropdown items to `button` elements automatically provides correct role and keyboard activation, reducing the need for custom JS event handlers for Enter/Space keys.
**Action:** Always prefer native semantic elements over ARIA-fied `div`s when refactoring UI components.

## 2026-02-12 - Focus-within for Tooltips
**Learning:** Using the `:focus-within` CSS pseudo-class on tooltip containers provides immediate keyboard accessibility without any JavaScript changes.
**Action:** When implementing tooltips, wrap the trigger in a container and use `:focus-within` alongside `:hover` to show the tooltip content.
