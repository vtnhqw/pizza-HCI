# Add and welcome implementation plan

Goal: implement the approved + Add ordering direction and order-first welcome screen.
Architecture: retain the existing single-page HTML, CSS, state and demo actions.
Spec: user approved + Add, size selection, optional toppings, priced cart action and refreshed welcome via “ok do it all”.

- [x] Verify size-to-cart path and optional toppings using the existing Node test harness.
- [x] Update index.html menu/product labels, expose existing add-custom action at size selection, retain builder and editing behavior.
- [x] Refresh welcome markup and visual.css with smaller artwork, compact copy, primary Start ordering and secondary account actions.
- [x] Update PROJECT.md and run node --test tests/prototype.test.cjs.

Constraints: preserve local storage, drafts, cart editing, demo-only authentication and existing unrelated edits. No new dependencies.
Review: saved toppings must remain visible; cart editing must save rather than add; narrow screens must scroll; account actions must remain usable.

Validation: 38 Node tests passed; git diff --check passed. Visual browser inspection was not performed.

