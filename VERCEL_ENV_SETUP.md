# Vercel Environment Variables Setup

Your social login credentials should NOT be committed to GitHub in `.env`. Instead, set them up in Vercel for production.

---

## **Step 1: Go to Vercel Dashboard**

1. Visit [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Select your project: **majorityhairsolutions.com**
4. Click **Settings** → **Environment Variables**

---

## **Step 2: Add Each Variable**

Click **Add New** and enter the following variables one by one:

| Variable Name | Value | Environment |
|---|---|---|
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | `pk_live_YOUR_ACTUAL_KEY` | Production, Preview |
| `REACT_APP_GOOGLE_CLIENT_ID` | `849928045683-eod0qbpf34iekrsuu88sv6jo7nkmh5mm.apps.googleusercontent.com` | Production, Preview |
| `REACT_APP_INSTAGRAM_APP_ID` | `1370476281481412` | Production, Preview |
| `REACT_APP_TIKTOK_CLIENT_KEY` | `awi915gbvgte4lr6` | Production, Preview |
| `REACT_APP_TIKTOK_CLIENT_SECRET` | `PUgIFqXcZouEioy3QvmJ6qOTHDi3hcDX` | Production, Preview |

---

## **Step 3: For Each Variable:**

1. Click **Add New** at the top
2. Enter the **Name** (e.g., `REACT_APP_GOOGLE_CLIENT_ID`)
3. Enter the **Value** (from the table above)
4. Select **Environment**: Check both `Production` and `Preview`
5. Click **Save**

---

## **Step 4: Redeploy**

After adding all variables:

1. Go back to the **Deployments** tab
2. Find the latest commit
3. Click **Redeploy** button

This will rebuild your frontend with the new environment variables.

---

## **Step 5: Verify**

1. Wait for redeploy to finish (green checkmark)
2. Hard refresh the live site: `Ctrl+Shift+R`
3. Check the login page - Instagram and TikTok buttons should appear
4. Test Google login

---

## **Important Notes:**

- **NEVER** commit `.env` files with real secrets to GitHub
- Local `.env` is for development only
- Vercel handles production secrets securely
- Environment variables are injected at build time
- Include these in `.gitignore`:
  ```
  .env
  .env.local
  .env.*.local
  ```

---

## **If Variables Don't Show:**

1. Check that you selected correct **Environment** (Production + Preview)
2. Verify the **exact variable name** matches (case-sensitive)
3. Redeploy again from Deployments tab
4. Wait 2-3 minutes for CDN cache to clear
5. Hard refresh browser: `Ctrl+Shift+Delete` then `Ctrl+Shift+R`

---

## **Testing in Development:**

To test locally with these credentials:

1. Update your local `.env` with the actual API credentials
2. Run `npm start`
3. Test the social login buttons
4. Never push `.env` to GitHub (it's in `.gitignore`)
