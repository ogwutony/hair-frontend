# ⚡ QUICK START - GET THE WEBSITE LIVE

## 5-Minute Setup for Vercel Deployment

### Step 1: Prepare Your Git Repository
```bash
cd "c:\Users\ogwut\OneDrive\Documents\MajorityhairSolutionWebsite\The Majority Website\hair-subscription"
git add .
git commit -m "Update CORS config, add loading spinner, prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to **https://vercel.com/new**
2. Click "Import Git Repository"  
3. Paste your GitHub repo URL
4. Click "Import"
5. Set the root directory to: `hair-subscription/`
6. Click "Continue"

### Step 3: Add Environment Variables
Click "Environment Variables" and add:

| Variable | Value |
|----------|-------|
| REACT_APP_STRIPE_PUBLISHABLE_KEY | pk_test_YOUR_KEY (from Stripe) |
| REACT_APP_GOOGLE_CLIENT_ID | YOUR_GOOGLE_CLIENT_ID |
| REACT_APP_BACKEND_URL | https://hair-backend-2.onrender.com |

### Step 4: Deploy!
Click "Deploy" and wait 2-3 minutes for build to complete.

### Step 5: Test It
- Open your Vercel URL (e.g., `https://majority-hair-solution.vercel.app`)
- Try to login/signup
- Check browser console (F12) for any errors
- Backend should be ready at `https://hair-backend-2.onrender.com`

---

## What's Already Fixed ✅

1. **CORS Configuration** - Backend now accepts requests from your domain
2. **Loading Spinner** - Shows when server is waking up (no more blank screens)
3. **Health Check** - Backend has `/api/health` endpoint
4. **Production Build** - React app builds successfully
5. **Environment Variables** - Properly documented and configured

---

## Common Issues & Fixes

**"Failed to Fetch" error**
→ Open `https://hair-backend-2.onrender.com` in a new tab → Wait 60 seconds → Refresh

**401 Unauthorized**  
→ Already fixed with CORS update ✅

**Blank page on load**
→ Loading spinner will show while server wakes up ✅

**Google Sign-In button missing**
→ Verify `REACT_APP_GOOGLE_CLIENT_ID` is set in Vercel dashboard

---

## Next Steps

1. Go to https://vercel.com and deploy
2. Add your environment variables
3. Test the website at your Vercel URL
4. Once working, add custom domain `majorityhairsolutions.com` in Vercel settings
5. Monitor logs: https://dashboard.render.com (backend) + https://vercel.com (frontend)

**⏱️ Total time: ~5 minutes**

---

## Need Help?

See `DEPLOYMENT_GUIDE.md` for detailed instructions on:
- Setting up Stripe webhooks
- Configuring custom domains
- Monitoring and debugging
- Backend environment variables
