# 📋 STEP-BY-STEP DEPLOYMENT CHECKLIST

## PHASE 1: Pre-Deployment (You Are Here ✓)

✅ **Completed:**
- CORS configuration updated in backend
- Loading spinner component added
- Health check endpoint added
- Production build successful
- Environment variables documented
- Deployment guides created

---

## PHASE 2: Deploy to Vercel (5 minutes)

### Step 2.1: Ensure Code is Committed to Git
```bash
cd "c:\Users\ogwut\OneDrive\Documents\MajorityhairSolutionWebsite\The Majority Website\hair-subscription"
git status
# You should see:
#   - Package.json (no changes needed)
#   - App.js (modified - loading spinner added)
#   - server.js (modified - CORS + health check)
#   - .env.local (new file - will be ignored)
#   - DEPLOYMENT_GUIDE.md (new file)
#   - QUICK_START.md (new file)

# Commit all changes
git add .
git commit -m "🚀 Prepare for live deployment: Add loading spinner, health check, improved CORS"
git push origin main
```

### Step 2.2: Go to Vercel Dashboard
1. Open **https://vercel.com**
2. Sign in with GitHub/Google
3. Click "Add New..." → "Project"

### Step 2.3: Import Your Repository
1. Click "Import Git Repository"
2. Paste your repo URL (if private, authorize GitHub first)
3. Select the repository
4. Click "Continue"

### Step 2.4: Configure Project
1. **Root Directory:** Set to `hair-subscription/` (if the repo root is not the app folder)
2. **Build Command:** Should be `npm run build` (auto-detected)
3. **Output Directory:** Should be `build` (auto-detected)
4. Click "Continue"

### Step 2.5: Add Environment Variables ⚠️ CRITICAL

Click "Environment Variables" and add these EXACTLY:

```
REACT_APP_STRIPE_PUBLISHABLE_KEY
  └─ Value: pk_test_51ABC123XYZ... (from https://dashboard.stripe.com/apikeys)

REACT_APP_GOOGLE_CLIENT_ID  
  └─ Value: 123456789-xyz.apps.googleusercontent.com (from Google Cloud Console)

REACT_APP_BACKEND_URL
  └─ Value: https://hair-backend-2.onrender.com
```

**⚠️ IMPORTANT:** These are PUBLIC keys (safe to expose). Do NOT use:
- Stripe SECRET keys in frontend
- Database passwords in frontend
- JWT secrets in frontend

### Step 2.6: Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. You'll see: "🎉 Congratulations! Your site is live at..."
4. Copy your Vercel URL (e.g., `https://majority-hair.vercel.app`)

---

## PHASE 3: Configure Vercel Domain (Optional - 2 minutes)

If you want a custom domain instead of `vercel.app`:

### Step 3.1: In Vercel Dashboard
1. Go to your project → **Settings** → **Domains**
2. Click "Add Domain"
3. Enter: `majorityhairsolutions.com`
4. Click "Add"

### Step 3.2: Update DNS at Your Domain Registrar
Vercel will show you DNS settings. You'll need to:
- Add a **CNAME** record pointing to `cname.vercel.com`
- OR update **Nameservers** to Vercel's (they'll provide them)

Common registrars:
- **GoDaddy:** Domain Settings → DNS
- **Namecheap:** Advanced DNS
- **Google Domains:** Custom records

Wait 24-48 hours for DNS to propagate.

---

## PHASE 4: Configure Backend (Render.com)

Your backend should already be deployed at: `https://hair-backend-2.onrender.com`

### Step 4.1: Verify Backend is Running
```bash
# Open in browser or terminal:
curl https://hair-backend-2.onrender.com/api/health

# Should return:
# {"status":"ok","message":"Backend is running"}
```

### Step 4.2: Check/Update Environment Variables

1. Go to **https://dashboard.render.com**
2. Click on your service (hair-backend-2)
3. Go to **Environment** tab
4. Verify these are set:

```
MONGODB_URI=mongodb+srv://admin:admin123@majorityhairsolutions...
JWT_SECRET=your-secure-32-char-secret-key
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_STRIPE_LIVE_KEY (NOT sk_test)
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
GOOGLE_CLIENT_ID=123456789-xyz.apps.googleusercontent.com
NODE_ENV=production
PORT=5000
```

### Step 4.3: Add CORS Allowed Origin (If Using Custom Domain)
If you added a custom domain, add it to `allowedOrigins` in server.js:

```javascript
const allowedOrigins = [
  'https://majorityhairsolutions.com',        // ← Add your custom domain here
  'https://www.majorityhairsolutions.com',    // ← And www version
  'https://majority-hair.vercel.app',          // Keep Vercel URL
  'http://localhost:3000'                       // Keep local dev
];
```

Then redeploy backend:
```bash
git push origin main
# Render will auto-deploy
```

---

## PHASE 5: Testing (5 minutes)

### Test 5.1: Frontend Loads
1. Open your Vercel URL (e.g., `https://majority-hair.vercel.app`)
2. You should see the Majority Hair Solutions homepage
3. Open browser DevTools (F12) → Console
4. **Should see NO red errors** ❌→✅

### Test 5.2: Backend Communication
1. Try to **Sign Up**
   - Should work without "Failed to Fetch" error
   - If server is asleep, should show loading spinner
2. After 60 seconds, try again
3. You should be able to create an account

### Test 5.3: Authentication
1. **Log In** with your test account
2. You should see your Profile page
3. Rank badge should display
4. **Should NOT see 401 Unauthorized errors** ❌→✅

### Test 5.4: Checkout Flow
1. Go to `/checkout` or click product
2. Stripe payment form should load
3. Enter test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Click "Complete Purchase"
7. Should succeed (or show test mode message)

### Test 5.5: Check Console Logs
Press F12 in browser and:
1. Go to **Console** tab
2. Look for any **red errors** ❌
3. Common errors to FIX:
   - `"CORS policy"` → Your CORS config
   - `"401 Unauthorized"` → Your JWT token
   - `"Failed to fetch"` → Backend not running

---

## PHASE 6: Production Verification

### Checklist Before Going Live

- [ ] Frontend builds successfully without errors
- [ ] Website loads at Vercel URL
- [ ] No red errors in browser console
- [ ] Login/Signup works
- [ ] Google Sign-In button appears and works (if enabled)
- [ ] Backend health check returns 200 status
- [ ] Profile page displays correctly
- [ ] Rank badges display correctly
- [ ] Checkout flow loads (even if payment is test mode)
- [ ] Loading spinner shows when server is waking up
- [ ] No CORS errors preventing communication
- [ ] Custom domain resolves (if using `majorityhairsolutions.com`)

### If Any Test Fails

See **"Troubleshooting" section in DEPLOYMENT_GUIDE.md**

---

## PHASE 7: Go Live! 🎉

### Step 7.1: Switch to Production Stripe Keys
1. Go to **https://dashboard.stripe.com**
2. Click "Live Mode" at top
3. Get your **LIVE** keys (sk_live_xxx, pk_live_xxx)
4. Update in Vercel dashboard under Environment Variables

### Step 7.2: Update Backend
1. Update `STRIPE_SECRET_KEY` in Render with sk_live_ key
2. Test a payment with your actual credit card (charge will be refunded immediately)

### Step 7.3: Test Email Notifications
1. Make a test purchase with live key
2. Check your email for confirmation
3. If not received, check Gmail spam folder and auth settings

### Step 7.4: Monitor Logs
1. **Frontend errors:** https://vercel.com (select project → Deployments → Logs)
2. **Backend errors:** https://dashboard.render.com (select service → Logs)

---

## SUMMARY: What Gets Deployed Where

| Component | Where | URL |
|-----------|-------|-----|
| **Frontend (React)** | Vercel | https://majorityhairsolutions.com |
| **Backend (Node/Express)** | Render | https://hair-backend-2.onrender.com |
| **Database (MongoDB)** | MongoDB Atlas | (internal, not public) |
| **Payments (Stripe)** | External API | (external service) |

---

## TOTAL TIME ESTIMATE

- Phase 1: ✅ Done (0 min)
- Phase 2: 5 minutes ⏱️
- Phase 3: 2 minutes (optional)
- Phase 4: 2 minutes
- Phase 5: 5 minutes
- Phase 6: 2 minutes
- Phase 7: 5 minutes

**Total: ~20 minutes for fully working live website** ✨

---

## Next Actions

1. ✅ You've completed Phase 1
2. ➡️ **Next: Follow Phase 2 to deploy to Vercel**
3. Then: Follow remaining phases
4. Finally: Monitor logs and handle any issues

**Questions?** See DEPLOYMENT_GUIDE.md for detailed troubleshooting.
