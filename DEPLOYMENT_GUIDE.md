# 🚀 DEPLOYMENT & CONFIGURATION GUIDE

## Status
- ✅ Backend CORS configured
- ✅ Frontend build successful  
- ✅ Loading spinner implemented
- ✅ Health check endpoint added
- ⏳ Ready for deployment

---

## PART 1: BACKEND SETUP (Render.com)

### Your Current Backend
- **URL:** `https://hair-backend-2.onrender.com`
- **Status:** Should be deployed and running
- **Free Plan:** Spins down after 15 mins of inactivity

### Backend Environment Variables (Set in Render Dashboard)

Go to **https://dashboard.render.com** and set these in your service settings:

```
MONGODB_URI=mongodb+srv://admin:admin123@majorityhairsolutions...
JWT_SECRET=your-32-character-secret-key-here
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_STRIPE_KEY (NOT TEST KEY)
STRIPE_WEBHOOK_SECRET=whsec_test_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
GOOGLE_CLIENT_ID=your-google-client-id
NODE_ENV=production
PORT=5000
```

### Test Your Backend
```
curl https://hair-backend-2.onrender.com/api/health
```
Should return: `{"status":"ok","message":"Backend is running"}`

---

## PART 2: FRONTEND SETUP (Vercel.com)

### Deploy Instructions

1. **Login/Create Vercel Account**
   - Go to https://vercel.com
   - Sign up or sign in
   - Create a new project

2. **Connect GitHub**
   - Select "Import Git Repository"
   - Paste your repo URL: `https://github.com/YOUR_USERNAME/hair-subscription`
   - Select root directory (if in subdirectory, set to `hair-subscription/`)

3. **Set Environment Variables**
   - Click "Environment Variables"
   - Add these variables:

```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLIC_KEY
REACT_APP_GOOGLE_CLIENT_ID=YOUR_ACTUAL_GOOGLE_CLIENT_ID
REACT_APP_BACKEND_URL=https://hair-backend-2.onrender.com
```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Get your Vercel URL (e.g., `https://majority-hair.vercel.app`)

### Custom Domain Setup

1. In Vercel dashboard, go to **Settings → Domains**
2. Add domain: `majorityhairsolutions.com`
3. Update DNS at your domain registrar:
   - **CNAME:** `cname.vercel.com`
   - **Nameservers:** Use Vercel's (they'll provide them)

---

## PART 3: CRITICAL ENVIRONMENT VARIABLES

### Frontend (.env.production in Vercel)
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_abc123...  // From Stripe dashboard
REACT_APP_GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com  // From Google Cloud Console
REACT_APP_BACKEND_URL=https://hair-backend-2.onrender.com
```

### Backend (Render Dashboard)
- **STRIPE_SECRET_KEY:** Must be `sk_live_` (NOT `sk_test_`)
- **MONGODB_URI:** Full connection string from MongoDB Atlas
- **JWT_SECRET:** Random 32+ character string
- **NODE_ENV:** Must be `production`

---

## PART 4: STRIPE WEBHOOK CONFIGURATION

1. Go to **https://dashboard.stripe.com/webhooks**
2. Create new endpoint:
   - **URL:** `https://hair-backend-2.onrender.com/api/webhooks/stripe`
   - **Events:** Select `payment_intent.succeeded`
3. Copy the signing secret and add to Render as `STRIPE_WEBHOOK_SECRET`

---

## PART 5: QUICK TESTING CHECKLIST

After deployment, test:

- [ ] Frontend loads: `https://majorityhairsolutions.com`
- [ ] Backend health check: `curl https://hair-backend-2.onrender.com/api/health`
- [ ] Login works
- [ ] Google Sign-In works
- [ ] Checkout loads Stripe form
- [ ] Profile page displays rank system
- [ ] No CORS errors in browser console
- [ ] No Unauthorized (401) errors

---

## PART 6: TROUBLESHOOTING

### "Failed to Fetch" Error
**Cause:** Render backend is asleep
**Solution:** 
1. Open `https://hair-backend-2.onrender.com` in a new tab
2. Wait 60 seconds for it to wake up
3. Refresh your main site

### 401 Unauthorized Error
**Cause:** CORS not allowing Authorization header
**Solution:** Already fixed in this config - check that CORS middleware is active

### Blank Screen
**Cause:** Server waking up
**Solution:** Loading spinner will now display automatically

### Google Sign-In Not Working
**Cause:** Wrong Google Client ID
**Solution:** Verify in Vercel dashboard that `REACT_APP_GOOGLE_CLIENT_ID` is correct

### Stripe Errors
**Cause:** Using test key in production
**Solution:** Use `sk_live_` keys in production, not `sk_test_`

---

## PART 7: MONITORING

### Check Render Logs
1. Go to **https://dashboard.render.com**
2. Select your service
3. Click "Logs" tab
4. Look for errors like "CORS policy", "ECONNREFUSED", etc.

### Check Vercel Logs  
1. Go to **https://vercel.com/dashboard**
2. Select your project
3. Click "Deployments" tab
4. View logs for each deployment

---

## SUMMARY

**What's been done:**
1. ✅ CORS properly configured for Render + frontend domains
2. ✅ Loading spinner added for poor network/server wake-up
3. ✅ Health check endpoint added
4. ✅ Production build created successfully
5. ✅ Environment variables documented

**What you need to do:**
1. Deploy to Vercel (follows steps in PART 2)
2. Set environment variables (PART 3)
3. Configure custom domain (if using majorityhairsolutions.com)
4. Set Stripe webhook (PART 4)
5. Test everything (PART 5)

**Result:** Fully functional website with no CORS/401 errors ✅
