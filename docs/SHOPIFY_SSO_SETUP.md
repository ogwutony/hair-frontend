# Shopify / community shared sign-in activation

The community navigation and styling are deployed independently. Shared login is implemented but remains off until Shopify callback registration and the backend switch are completed.

Existing Shopify Headless storefront: The Majorities Headless (397451), public web client. No secret or new app is needed.

Register these application settings in Shopify → Headless → The Majorities Headless → Customer Account API. Preserve other registered entries:

- Callback URI: `https://community.themajorities.com/auth/shopify/callback`
- JavaScript origin: `https://community.themajorities.com`
- Logout URI: `https://community.themajorities.com/login`

Deploy the matching `hair-backend` changes, then set `SHOPIFY_CUSTOMER_SSO_ENABLED=true` on its Render service. No frontend environment variable is required: the community checks `/api/auth/shopify/config` at runtime. Until the backend switch is on, existing sign-in/sign-up forms remain available.

The flow is linear: community account icon → one sign-in page → Shopify's hosted login → callback → existing community member session → The Duma. A live Shopify login is reused. The backend exchanges the authorization code using PKCE and fetches customer identity from this store's Customer Account API. It never trusts a caller-provided email. Existing profiles/ranks/posts remain attached by verified email, and banned members remain blocked. Shopify tokens are not used as community API tokens.

Validation before activation:

1. Confirm deployment of both repositories and registration of the three URLs above.
2. Turn the backend flag on. Check `/login` and `/signup` both display the single Shopify login choice.
3. In a clean browser session, sign in from the store, open community `/login`, complete the redirect, and confirm no second credential challenge is requested.
4. Repeat beginning from the community. Confirm the existing profile and permissions, then open the Shopify customer account.
5. Check denied/expired/replayed callbacks fail closed and do not sign anyone in.
6. Sign out from the community account icon; confirm Shopify logout occurs and the community session is cleared. Shopify-origin logout does not immediately revoke an already-issued community JWT; that requires server-side session revocation/webhook support if desired.

Rollback: set `SHOPIFY_CUSTOMER_SSO_ENABLED=false` and restart the backend. The legacy forms return; no community data migration is performed.

References: https://shopify.dev/docs/api/customer/latest and https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/getting-started
