<!-- Copilot instructions for the hair-subscription React app -->
# Repo snapshot

- Bootstrapped with Create React App. Primary entry: [src/index.js](src/index.js#L1).
- Main UI and product logic live in [src/App.js](src/App.js#L1). There is no component folder — edits typically happen directly in `App.js`.
- Frontend talks to a backend checkout endpoint at `http://localhost:4242/create-checkout-session` (see `axios.post` in `src/App.js`). Stripe keys and price IDs are placeholders in `src/App.js`.

# Goals for an AI coding agent

- Make small, focused edits: prefer updating `src/App.js` for UI/product changes or adding small components under `src/`.
- Avoid large refactors unless requested — this repo is a small CRA app with inline styles and no global state manager.
- Preserve Create React App conventions (scripts in `package.json`) and don't `eject`.

# Build / dev / test commands

- Start dev server: `npm start` (serves at http://localhost:3000).
- Run tests: `npm test` (CRA interactive watcher).
- Production build: `npm run build` (output in `build/`).

# Key patterns and notes (do not assume beyond these)

- Inline styles: `src/App.js` contains a `styles` object — matching visual changes should update or extract from there.
- Product data: a `products` constant in `src/App.js` drives lists. To add a product, update that object and ensure backend Stripe `priceId` mapping is updated accordingly.
- Selection logic: `selection` state stores arrays per category limited to two items — be cautious when changing selection behavior (see `handleSelect`).
- Checkout flow: frontend calls backend `create-checkout-session` and then calls `stripe.redirectToCheckout({ sessionId })` (see `handleCheckout`). Backend must run at port 4242 during local dev for end-to-end checkout.

# Integration points & external deps

- Stripe: `@stripe/stripe-js` with `loadStripe("YOUR_STRIPE_PUBLISHABLE_KEY")` in `src/App.js`. Replace with an environment var (e.g. `process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY`) when wiring to real keys.
- HTTP client: `axios` used for backend calls.
- Testing libs: `@testing-library/*` packages are present — tests (if added) should follow their patterns.

# Examples and actionable snippets

- Add a shampoo product: update `products.shampoos` in [src/App.js](src/App.js#L1).
- Wire real Stripe key: change `loadStripe(...)` to `loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)` and document that devs should set `REACT_APP_STRIPE_PUBLISHABLE_KEY` in their environment.
- Run checkout end-to-end: start frontend (`npm start`) and ensure backend server that answers `POST /create-checkout-session` runs on port 4242.

# What not to do

- Don't assume a backend exists in this repo — there is no server code here. Any changes that require server-side updates (webhooks, price mapping) must be coordinated with a separate service.
- Don't convert inline styles into CSS modules automatically; propose it first.

# Where to look next

- UI and behavior: [src/App.js](src/App.js#L1).
- Static entry / boot: [src/index.js](src/index.js#L1).
- Project scripts and deps: [package.json](package.json#L1).

If any section is unclear or you'd like the agent to enforce additional conventions (env var patterns, folder layout, or componentization rules), tell me which and I'll update this file.
