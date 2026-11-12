# Ordering UX refinements

Goal: Implement every improvement accepted from the UX review while retaining the proposal layout, offline behavior, local storage key, current branding and photo assets.

Files: index.html (actions, transactional cart editing, labels); visual.css (readability and compact Home); tests/prototype.test.cjs (behavioral regressions); PROJECT.md (final behavior).

- [ ] Make photo/name open details, Customize start pizza builder, Add immediately add ready-made items.
- [ ] Use consistent builder Back actions and separate Exit/Cancel edit. Show selected size and explicit starting prices; rename Preview to Your selections, contextual next labels.
- [ ] Search all categories without a misleading selected category.
- [ ] Carry checkout context through voucher redemption in Rewards and return after applying.
- [ ] Edit cart pizza size/toppings transactionally, preserving quantity and merging identical entries only within the 99-item limit. Cancel does not mutate the cart; restored edit state is validated.
- [ ] Increase small descriptions/prices and compact Home without moving its sections.
- [ ] Run regression suite, review edge cases and record browser verification limits.

Review focus: stale cart-edit index, cancelling/reloading an edit, merging quantities above 99, invalid item actions, rewards entered from checkout versus bottom navigation, narrow card width.
