# Pizzazz visual refresh

Goal: Refine the existing local coursework prototype, keeping the proposal's mobile layout and implementing a welcome/login screen whose buttons lead directly home.

Architecture: Retain the existing buildless HTML and state/actions. Add local food assets, a vector app mark, and a presentation stylesheet. No backend, real login or deployment.

Reference: Original PDF embedded sketches 53/54 (large pizza, welcome, Sign Up/Log In), 63/64 (brand, search, category tiles), 68/69 (four categories, two-column product cards, basket).

Design: Warm ivory, deep red, dark espresso text, restrained rounded cards, generous food imagery. Keep existing ordering and rewards flows, price calculations, local storage key and phone dimensions. Use original slice/spark app mark with Pizzazz wordmark. Generated menu photos are illustrative; keep the dynamic SVG builder because it responds to topping choices.

- [x] Add local generated photography and logo; preserve offline operation.
- [x] Add welcome view and direct-to-home demo actions, reachable again from Profile.
- [x] Refresh home into proposal-style menu grid, refine common controls and details.
- [x] Run existing regression suite plus login/navigation checks and asset checks.
- [x] Update PROJECT.md and document verification limits.

Browser control is currently unavailable. PDF renderer was blocked by application control; original embedded sketch JPEGs were extracted losslessly with Node and visually inspected instead.
