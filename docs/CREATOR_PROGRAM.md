# Creator program

How the creator checklist on `themajorities.com/pages/influencers` works, and how to run it.

## Pieces

| Piece | Where |
|---|---|
| Checklist page | Shopify theme **Horizon**: `templates/page.influencers.json`, `sections/creator-checklist.liquid`, `assets/creator-checklist.js`, `assets/creator-checklist.css` |
| Submissions, points, codes | `hair-backend`: `lib/creatorProgram.js` (rules, tested) and the `/api/creator/*` routes in `server.js` |
| Where posts appear | This app: The Duma › Culture › **Affiliate posts** (`/duma?view=culture-affiliate-posts`). Creator applications are under Culture › **Affiliates** (`/duma?view=culture-affiliates`) |
| Admin tools | This app: `/admin/moderation` › **Creator program** |

The page calls the backend directly (`https://hair-backend-1.onrender.com/api/creator`, set in the
section's **Creator service address** setting). The backend already allows `themajorities.com`
in CORS. No Shopify app or App Proxy is needed: a request is trusted only when it carries a valid
creator code **and** the email of the community account that code belongs to.

## On the checklist page

- The creator must be **logged in** to the store. Their email comes from that account (it is the same
  email as their community account), so the page never asks for a name or email.
- **Step 1 · Confirm your Affiliate code** (the "creator code" below, renamed on the page). Once confirmed,
  the code is remembered in that browser, so "Your points" loads straight away on the next visit.
- Content permission and partnership disclosure are agreed to on the creator application
  (Partner page › Commission & Agreements), not on the checklist.

## Points

| Action | Points |
|---|---|
| First Duma post for a product | 200 |
| Repeat Duma post, same product | 150 |
| First post link on a platform for a product | 300 |
| Repeat link, same platform and product | 150 |

- Points go into the member's **rank score** (the profile page), the same ranking as the rest of the community.
- A post link can be paid only once, by anyone (tracking parameters and `www.`/`m.` are ignored).
- Links must be on the platform's own domain (checked on the server).
- Daily cap per creator over a rolling 24 hours: `CREATOR_DAILY_POINTS_CAP` on the backend
  (default 3000 until the owner picks a number). A post that crosses the cap earns only what is left.
- Every award is a row in the `creatorawards` collection: creator code, product, platform (or `duma`),
  URL or Duma post id, points, time.
- Hiding a post does not take its points back.

## Approving a creator

1. The creator applies at `community.themajorities.com/partner?category=influencer` and has a community account.
2. Open `community.themajorities.com/admin/moderation` (your email must be in the backend's `ADMIN_EMAILS`).
3. Under **Creator program**, press **Approve & issue code** next to them, or type their account email and press **Issue code**.
   They get an email with a code like `TM-ABCD-EFGH`.
4. **New code** replaces a leaked code; **Revoke** stops it working at once.

## Removing a creator post

On `/admin/moderation` › **Creator program** › **Hide a Duma post**, paste the post link
(`community.themajorities.com/duma/<id>`) or its ID and press **Hide now**. It disappears from
The Duma immediately. **Unhide** restores it.

## Changing the page

Everything on the page (text, products, platforms, links, upload limits, colors) is editable in
Shopify › Online Store › Themes › Customize › Influencers page. Platform IDs (`tiktok`, `x`, …)
must stay the same, because the server uses them. To add a product, add it in the theme **and** in
`PRODUCTS` in `hair-backend/lib/creatorProgram.js`.
