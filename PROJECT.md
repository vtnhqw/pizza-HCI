# Pizza Hut Pizzazz App

Last updated: 12 November 2026.

## Purpose and source of truth

Academic UI/UX coursework prototype for the Food and Beverage research theme. Redesign the Pizza Hut mobile experience to be simpler, clearer and more engaging for users of all ages, especially ages 18–40. This is not a commercial ordering service.

Preserve the original proposal, nine hand-drawn screen concepts, ethnography findings and storyboard. Improve their usability rather than inventing a different restaurant concept. Keep Pizza Hut-inspired branding and Malaysian Ringgit (RM).

This document records the supplied written brief and an inspection of `index.html`. The original embedded sketch images from `HCI - Project Proposal.pdf` were visually reviewed for this refresh: login (53/54), order modes (58), home (63), menu (68/69), fulfillment (84) and vouchers (89). Full PDF text/storyboard review remains incomplete. The original source materials take precedence if a discrepancy is found.

## Running and continuing the project

- Open `index.html` in a browser. No build, package installation or server is required.
- Markup, baseline CSS, demo data and JavaScript live in `index.html`; `visual.css` contains the visual refresh and `assets/` contains local artwork. Keep these files together. There is no framework or backend.
- Rendering uses JavaScript template strings, a central state object, `render()`, `nav()` and delegated `data-action` clicks.
- Local browser storage key: `pizzazz_demo_v2`. Cart, order mode, address, orders, points and game state are saved where storage is available.
- Profile → Reset all local demo data resets the demo. Browser/file-origin policies may affect persistence.
- Run regression checks with `node --test tests/prototype.test.cjs` (Node.js 18+). No npm installation is required. Tests execute the actual application script with a minimal DOM/storage boundary; they are not a substitute for visual browser testing.
- Interface icons use inline SVG references/adaptations of Lucide, styled with CSS. No CDN, icon package or downloaded asset dependency is used. See `THIRD_PARTY_NOTICES.md` for attribution. The mushroom/capsicum ingredient icons and `assets/pizzazz-mark.svg` are original prototype artwork. Menu and welcome photography is AI-generated illustrative artwork; see `assets/README.md`.

Before future changes, read this file and inspect the relevant implementation. Preserve working interactions and storage compatibility. Update this document when a feature's status changes.

## Presentation baseline

The desktop preview uses an iPhone-style **393 × 852 CSS-pixel portrait screen**, surrounded by an 8px bezel (409 × 868 outer dimensions). This is a chosen reference size, not a claim to reproduce every iPhone model or its physical dimensions. Browser zoom and display density affect its physical size.

The preview has rounded corners, a decorative Dynamic Island, status indicators and home indicator. App content scrolls inside the fixed screen. Below 441px viewport width, the app fills the available viewport, removes simulated device chrome and respects browser safe-area insets. Short desktop windows can scroll the surrounding page; the phone does not stretch to fit their height. Native orientation locking is not implemented.

## Original problems and research requirements

Address cluttered navigation, excessive banners, difficulty finding/comparing items, unclear pizza customization, fragmented external tracking, limited loyalty engagement and confusing preparation/delivery progress.

Research involved three participants including younger users and an older adult. Improvements must reduce unnecessary scrolling; use clear labels and recognizable icons; show sizes and prices clearly; highlight chosen toppings with visible preview feedback; preserve choices across navigation; explain price calculations; make checkout easy to verify; retain the selected order mode; and make tracking easy to find and understand.

Use a clean mobile-first layout, consistent typography/components, readable contrast and large touch targets. Avoid promotional clutter. Interface symbols use inline SVG icons; menu food uses local AI-generated photography, not verified Pizza Hut product photography. The pizza builder uses the selected pizza’s original menu photo; extra toppings are shown through selected controls and the summary. Current demo prices are not official menu prices. Controls have visible keyboard focus, selected-state attributes and accessible labels. Dialogs move/trap focus, close on Escape and make the background inert. A full assistive-technology audit remains pending.

## Screen mapping and implementation audit

Statuses describe source-code capabilities, not a claim that every interaction has passed browser testing.

| Original / proposed screen | Current function or view | Status | Improvement and important gaps |
|---|---|---|---|
| 1. Login / Registration | `login()`; fresh state starts at `login` | Implemented demo | Compact pizza artwork, order-first Browse menu action, secondary Log in / Sign up actions; all open Home directly without credentials, per user request. Profile can return to welcome. No real authentication exists. |
| 2. Order Type Selection | Mode buttons in `home()` and `profile()` | Partial | Delivery, Takeaway and Dine-in are selectable/persisted, but a dedicated entry screen is missing. |
| 3. Homepage | `home()` | Implemented | Custom Pizzazz logo, search, categories, two-column photo menu and bottom navigation. One restrained interactive pizza-builder banner. |
| 4. Food Menu / Selection | Food list within `home()` | Partial | Search, four categories, RM prices and details/cart entry exist; dedicated menu view is missing. Original suggested Others category is absent. |
| 5. Food Details | `product()` | Implemented | Separate details with description, price and builder/add action. Pizza size selection is inside the builder. |
| 6. Shopping Cart | `cart()` | Implemented | Edit pizza size/toppings in place, preserve quantity, cancel safely, adjust quantity/remove, and review subtotal/fee/total. |
| 7. Delivery / Pickup Selection | Form within `checkout()` | Partial | Separate persisted delivery, pickup and dine-in values; required input validation. Still needs a dedicated screen, real demo outlet choices, address confirmation and instructions. |
| 8. Voucher / Promotion | `vouchers()` | Implemented | Dedicated free-side voucher view with ownership, eligibility, apply/remove and unavailable states. One demonstration reward type, not a live promotions service. |
| 9. Checkout / Payment | `checkout()` | Implemented | Explicit order mode, mode-specific location, correctly highlighted simulated payment, customization summary, voucher discount and final total. Richer fulfillment controls remain planned. |
| Visual Pizza Builder | `builder()` | Implemented | Four steps: size, extra toppings, your selections, review. Original menu photo, selection feedback and live price; maximum five extra toppings. Per-pizza drafts survive navigation and reload. |
| Order Confirmation | `confirmation()` | Implemented | Demo order ID, summary and tracking action. |
| Order Tracking | `tracking()` | Implemented | Mode-specific readiness/completion stages and estimates, manual/automatic progress. Notifications are in-app toasts only; no real tracking or push service. |
| Order History | `orders()` | Implemented | Local order list with tracking access. No server history. |
| Loyalty / Rewards | `rewards()` | Implemented | Initial 120 demo points, earning and persistent free-side voucher redemption. Voucher can be applied at checkout and is consumed only on an eligible placed order. |
| Mini-game | Embedded in `rewards()` | Implemented | Pick one of three boxes, win 20 points, start another round. New rounds choose a random winning box. One reward per round; unlimited demo rounds. |
| Profile | `profile()` | Implemented | Supporting local profile/preferences/reset screen; additional to original nine sketches, not a replacement for login. |

## Required navigation

Preserve this intended journey, restoring missing standalone screens in future work:

Login / Sign Up → Home (order type selected on Home) → Menu → Food Details → optional Pizza Builder → Cart → Delivery / Pickup / Dine-in Details → optional Vouchers → Checkout / Payment → Confirmation → Tracking.

Rewards and mini-games remain accessible without interrupting ordering. Current bottom navigation is Home / Orders / Rewards / Profile; the written reference suggests Home / Menu / Orders / Rewards. Resolve this difference against the original sketches before changing navigation.

Food Details and Pizza Builder must remain separate. Voucher selection and customization are optional. Do not unnecessarily remove or merge original screens.

## Functional and data rules

- Support browse/search, item details, customization, cart editing, eligible demo vouchers, checkout review, simulated payment, demo orders, tracking, loyalty and mini-games.
- Current size surcharges: S +RM 0, M +RM 3, L +RM 6. Extra topping prices come from `TOPPINGS`. Delivery fee is RM 4 for a nonempty delivery cart; other modes have no fee.
- Points earned are the floor of the final order total after discounts, including delivery fee; this policy is shown in Rewards.
- Mode stays consistent through checkout and the saved order. Fulfillment values are stored independently as `address`, `pickupOutlet` and `dineInOutlet`; an empty required value blocks ordering.
- `drafts` stores selected size/extra toppings by pizza ID. Reopening a builder restores its draft. Same-item cart entries merge regardless of topping-selection order. Quantities are capped at 99 per entry.
- Delivery stages: Order Received → Preparing → Baking → Out for Delivery → Delivered. Takeaway ends with Ready for Pickup → Collected. Dine-in ends with Ready to Serve → Served. Progress advances about every 30 seconds on the visible tracking screen or on manual advance; it does not jump through elapsed stages after being away.
- Voucher policy (proposed demo rule): 100 points redeem one saved free-side voucher. At most one can be held at a time. It discounts one unit of the lowest-priced side in the cart, leaves delivery fees unchanged, and cannot be applied without a side. Removing the side removes the discount; placing an ineligible order does not consume the saved voucher. Cancellation/navigation does not consume it.
- The `pizzazz_demo_v2` storage key is retained. Startup normalizes invalid fields/collections and rejects invalid cart/order entries rather than crashing. Reset creates a deep fresh state, so prior cart mutations cannot contaminate default data.
- All payments, restaurant orders, delivery, notifications are simulated. Never request actual payment credentials or claim real services are connected.

## Scope alignment and next priorities

1. Complete remaining original PDF/storyboard review and create `docs/WIREFRAMES.md` with separate ASCII wireframes for each major screen plus a navigation diagram. This file does not yet exist; do not treat proposed layouts as verified sketches.
2. Restore missing standalone order-type, menu and fulfillment screens without breaking the current working flow. The dedicated voucher screen now exists.
3. Replace free-text outlet details with clear demonstration outlet choices; add delivery instructions and address review.
4. Review recipe-topping visualization: the builder edits extras, not removal of the pizza's underlying recipe. Base recipe removal is not currently implemented.
5. Perform browser, keyboard, contrast, touch-target, small-screen and full-flow usability checks with the research tasks. Back/add/quantity controls now have a 44px minimum target; actual rendered layout and assistive-technology behavior still need browser evaluation.

No clearly unrelated commercial feature was found. Remaining alignment issues are missing/combined original screens, base-recipe customization limitations and navigation differences. External-order and profile views should remain supporting features, with simulated behavior clearly labelled.

## Development guardrails and verification

Check this document before major design decisions and `docs/WIREFRAMES.md` once created before changing screens. Explain significant departures from sketches using research evidence. Prefer reusable components when warranted, but do not refactor the app solely for documentation. Avoid unrelated functionality and preserve the academic scope.

Verify fixed desktop dimensions, internal scrolling, bottom navigation/action reachability, and narrow-screen safe areas at 320px, 393px and desktop widths. Regression walkthrough: search → details → customize → cart → quantity edit → checkout → voucher → demonstration order → tracking; also check rewards, dialog focus and reset. Test Delivery, Takeaway and Dine-in separately.

Latest change: inline SVG/CSS icons, repaired fulfillment/tracking, saved customization, cart merging, correct payment selection styling, persistent usable vouchers, robust storage initialization/reset, modal keyboard handling, touch targets and responsive spacing. Existing iPhone-style dimensions and coursework identity are retained.

Verification on 11 November 2026: 22 Node regression checks passed, covering the reproduced failures, all current view render functions, SVG markup, reloads, order modes, voucher lifecycle and duplicate submission. Browser/desktop automation was unavailable, so visual layout, real DOM interactions, focus trapping and physical-device rendering are **not yet visually verified**. No packages were installed. Do not claim that all possible bugs have been eliminated.

## Visual refresh — 12 November 2026

Welcome follows the proposal’s large-pizza composition and side-by-side Sign Up / Log In buttons. Home keeps brand, search and category hierarchy; the product grid follows the menu sketch’s two-column cards. User explicitly requested login to lead directly Home, so mode selection stays on Home. New local food photography covers all eight existing menu products. Builder artwork now uses the original selected menu photo (see the later builder refinement). An original slice-and-spark icon and Pizzazz wordmark appear on welcome and home; the icon is also the favicon.

New visitors and older saved Home sessions see welcome once. After entering, existing view persistence continues. Profile → Return to welcome screen allows replay without clearing cart, rewards or orders. No credentials are requested or stored.

Verification: all 22 Node regression tests passed; separate smoke checks confirmed login/signup routing, hidden welcome navigation, old data preservation, featured builder routing, all food categories and local assets. Browser host is unavailable, so rendered layout, narrow viewport screenshots and keyboard walkthrough remain unverified. PDF rendering was blocked by Windows application control; embedded source JPEGs were extracted losslessly and inspected instead.
## Apple-inspired UI refinement — 12 November 2026

Preserved the proposal-based screen structure, login-to-Home flow, categories, two-column menu, food imagery, builder and ordering logic. Updated the presentation with a system font stack (Apple system fonts on Apple devices; native fallbacks elsewhere), neutral grouped backgrounds, restrained red accents, iOS-like segmented order modes, softer cards, consistent corner radii, translucent navigation/actions, and reduced-motion/transparency support. Interactive controls keep at least 44px touch targets.

All 30 interface icons now use official Lucide SVG geometry vendored from the upstream repository, rather than hand-drawn approximations. SVGs remain embedded in index.html for offline use. Official attribution/license: assets/lucide/README.md and assets/lucide/LICENSE. The custom Pizzazz brand mark remains separate from interface icons.

Validation: 22 regression checks and the login/category/local-asset smoke checks passed. Desktop preview was attempted through the native Chrome window, but computer-use permission was not approved. Browser integration also remained unavailable; rendered viewport testing is still pending.

## Builder imagery and ingredient icons — 12 November 2026

User requested replacing the drawn pizza with the original menu picture. All four builder steps now show the selected pizza’s existing photo. The image stays unchanged when extra toppings are selected; selected cards, the summary and price provide feedback. Preview copy makes clear the original recipe is pictured.

Ingredient icons: official Lucide cheese; official Lucide Lab sausage (pepperoni), onion and olive. Lucide core/Lab inventories had no exact mushroom or capsicum match; these two use original ingredient-specific SVG drawings in the same stroke style, rather than generic circles/leaves. Lab license is retained in assets/lucide/LICENSE-lab.

Validation: all 22 regression checks passed; additional smoke checks confirmed the matching photo in all 16 pizza/step combinations, all ingredient icons, and functioning topping selection. Browser visuals were not reverified.

## Ordering UX refinements — 12 November 2026

Implemented all accepted findings from the UX review:

- Menu photo and name are detail buttons. Pizza cards have Customize; ready-made items have Add, which adds the item directly.
- Both builder Back controls go back one step, or return to the entry screen from step one. Exit/Cancel edit is separate.
- Pizza cards/details state Small from. Builder total shows the actual selected size, diameter, and per-pizza price including extras. Existing saved size preferences remain intact.
- Search explicitly says Results across all categories and clears category highlighting while searching.
- Voucher redemption through Rewards preserves checkout context, including across reload. Apply and return to checkout completes the journey; Rewards offers a return button. Opening Rewards via the bottom bar starts a normal Rewards visit.
- Cart pizza customization edits preserve quantity. Save updates the original item, merging identical configurations only when the combined quantity is at most 99. Cancel preserves the original cart and independent browsing drafts. Invalid restored edit targets return to Cart; stale edits cannot overwrite another item. Editing a quantity above one clearly states that all pizzas in that cart line change.
- Preview is now Your selections; Next labels explain the upcoming step. The original menu photo stays unchanged.
- Increased menu descriptions and topping prices, with explicit full-width card actions and 44px touch targets. Compacted Home heading, category tiles and spacing while keeping section order. Removed the empty Clear search button when no search is active.

Verification: 35 regression checks pass, including cart-edit quantity preservation/cancellation/reload/merging/limits/stale data, search scope, both Back controls, menu actions, price labels and voucher checkout return. JavaScript syntax and local asset presence checked. Native Chrome control was previously not approved, so this update has not received a rendered-browser layout check. A final secondary review was attempted but unavailable due to the reviewer usage limit; the changes were reviewed directly instead.

## Order-first entry update (2026-11-12)

Menu pizzas use + Add, opening size selection with a priced Add to Cart action. Customize toppings is optional; saved extras are listed before adding. The existing four-step customization and cart editing flows remain available. Welcome now prioritizes Browse menu, with compact artwork and secondary account actions; authentication remains simulated.

## App branding (2026-11-12)

The user-provided Glossy Pizza P Icon.png is copied unchanged to assets/pizzazz-logo.png and used for welcome/Home branding, the browser favicon and Apple touch icon.

## Tracking scope update (2026-11-12)

Per user direction, external-platform tracking is removed: no third-party demo, screen, entry buttons or unified-tracking promotional copy. Orders and normal in-app tracking remain. Previously saved external-demo views recover to Home through view validation.

## Pasta and drinks expansion (2026-11-12)

Pasta and Drinks now each have four choices. Added Spaghetti Bolognese (RM 14.90), Chicken Alfredo (RM 16.90), Spicy Arrabbiata (RM 12.90), Lemon Iced Tea (RM 5.90), Orange Juice (RM 6.90) and Sparkling Water (RM 4.90). All use existing details, search and direct-add cart flows. Prices and food photography are illustrative. Existing item IDs remain unchanged for saved carts.

## Sides expansion (2026-11-12)

Sides now has six choices: existing wings/fries plus Garlic Bread (RM 6.90), Mozzarella Sticks (RM 9.90), Potato Wedges (RM 7.90), and Mushroom Soup (RM 6.50). Added items use existing search, details, cart and free-side voucher eligibility. Prices are illustrative.

## Rewards page refresh (2026-11-12)

Rewards now leads with a compact points card and progress towards 100 points, then the free-side voucher with explicit Redeem reward / View voucher / Keep collecting states. A separate compact game card uses numbered boxes, a +20-point prize label and a Play again action after a completed round. Existing reward, voucher, game and checkout-return logic is preserved. Points earning terms remain visible below the game.
`nPickup outlet selection now uses three illustrative Kuala Lumpur outlets: Bukit Bintang (default), KL Sentral, and Bangsar. Selection persists; missing or legacy free-text pickup values default to Bukit Bintang. No geolocation or distance ranking is performed. Delivery and dine-in fields retain their existing behavior.

## App-only and annotated entry pages (13 November 2026)

- `/` (`index.html`) shows the centered phone app without the coursework panels.
- `/1/` (`1/index.html`) shows the same app with both notes panels. Static hosting should redirect the directory URL `/1` to `/1/` and serve `index.html` as its directory index.
- On narrow screens the annotated panels stack below the app. Both pages share the same CSS, assets, and localStorage key.
- After editing the main HTML, run `node scripts/build-pages.cjs` to regenerate the annotated entry. The tests check that the two entry pages stay in sync.
- Deploy the `1` directory alongside the root HTML, CSS, and assets. No live domain deployment was performed in this task.

Validation: all 51 Node tests pass, including entry-page parity and relative asset references. Browser rendering and live-host routing were not verified because Chrome access was unavailable.

## Expandable category navigation

Home now offers a horizontally scrollable category row with a visible Swipe for more hint, partially visible next category, keyboard-focusable items, and Show all / Show less chevron control. Expansion, category choice and menu items survive reload. Chicken adds tenders, BBQ wings and popcorn chicken; Desserts adds brownies, cheesecake and cookies. All six products have local illustrative photography, category promotions, search, product details and direct cart entry. Existing Sides items and voucher eligibility remain unchanged.

## Grouped pizza selection and compact promotions

The Add pizza step now has a native pizza-variety selector grouped into Chicken (BBQ Chicken, Chicken Aloha, Spicy Chicken), Beef (Pepperoni, Beef Supreme, Beef Meat Lovers), and Vegetarian (Margherita, Veggie Supreme). Small starting prices appear in the selector. Size and extra toppings remain separate controls. Browsing preserves independent drafts per pizza; changing variety during cart editing preserves quantity and extras, supports reload, checks the original cart signature, and leaves the original item untouched on Cancel.

Promotions now show the featured item, price, small image and action without the extra marketing headline and paragraph. Pizza previews in the size step are smaller to accommodate the selector. Both static entry pages are synchronized. Verification: 69 Node tests pass; browser visuals remain unverified.
