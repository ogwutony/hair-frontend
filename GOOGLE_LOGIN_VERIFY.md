# Google Login Verification Guide

Your Google login is now configured and ready to test!

---

## **Current Configuration**

- **Google Client ID**: `849928045683-eod0qbpf34iekrsuu88sv6jo7nkmh5mm.apps.googleusercontent.com`
- **Status**: ✅ Added to `.env` 
- **Scope**: `email profile`
- **Enabled**: Auto-detected from `REACT_APP_GOOGLE_CLIENT_ID`

---

## **Local Testing (Development)**

### Step 1: Start the Dev Server

```powershell
cd "C:\Users\ogwut\OneDrive\Documents\MajorityhairSolutionWebsite\The Majority Website\hair-subscription"
npm start
```

The app will run on `http://localhost:3000`

### Step 2: Navigate to Login Page

1. Open `http://localhost:3000/login`
2. You should see **"Continue with Google"** button
3. Click it

### Step 3: Complete Google OAuth

1. Google consent screen appears
2. Select your test Google account
3. Grant permissions: `email` and `profile`
4. You'll be redirected back to your site
5. Account should be created/logged in automatically

### Step 4: Verify Success

**If it works:**
- ✅ You're redirected to the homepage
- ✅ Your email appears in the profile
- ✅ Your rank displays (default: "bolshevik")
- ✅ You can navigate to `/profile`

**If it fails:**
- Open **F12** → **Console** tab
- Look for red error messages
- Check **Network** tab for failed requests

---

## **Production Testing (Live Site)**

### Step 1: Set Vercel Environment Variables

Follow [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) to add:
```
REACT_APP_GOOGLE_CLIENT_ID=849928045683-eod0qbpf34iekrsuu88sv6jo7nkmh5mm.apps.googleusercontent.com
```

### Step 2: Redeploy

In Vercel Dashboard:
1. Go to **Deployments**
2. Click **Redeploy** on latest commit
3. Wait for green checkmark (2-5 minutes)

### Step 3: Test on Live Site

1. Go to `https://majorityhairsolutions.com/login`
2. Hard refresh: `Ctrl+Shift+R`
3. Click **"Continue with Google"**
4. Complete OAuth flow
5. Verify you're logged in

---

## **Google OAuth Flow Diagram**

```
User clicks "Continue with Google"
        ↓
Google authorization popup opens
        ↓
User selects account & grants permissions
        ↓
Google returns access_token to your app
        ↓
Your app sends token to backend: POST /api/auth/google
        ↓
Backend creates/updates user & returns JWT token
        ↓
User is logged in!
```

---

## **Troubleshooting**

### "Google Sign-In not loaded"
- **Problem**: Google script failed to load
- **Solution**: 
  - Check CSP headers in Vercel (should allow `apis.google.com`)
  - Hard refresh browser: `Ctrl+Shift+Delete`
  - Check browser console for blocking extensions

### "Invalid client ID"  
- **Problem**: Wrong Client ID in environment
- **Solution**:
  - Verify exact Client ID: `849928045683-eod0qbpf34iekrsuu88sv6jo7nkmh5mm.apps.googleusercontent.com`
  - Check for extra spaces or typos
  - Verify in `.env` file (local) or Vercel (production)

### Google button doesn't appear
- **Problem**: `REACT_APP_GOOGLE_CLIENT_ID` is not set
- **Solution**:
  - Local: Check `.env` file has the variable
  - Production: Set it in Vercel Environment Variables
  - Restart dev server or redeploy

### "Redirect URI mismatch"
- **Problem**: Google OAuth config doesn't match your domain
- **Solution**:
  - Go to [Google Cloud Console](https://console.cloud.google.com)
  - Project: **Majority Hair**
  - OAuth 2.0 application
  - Add authorized redirect URIs:
    ```
    http://localhost:3000
    https://majorityhairsolutions.com
    ```

---

## **Code Location**

- **Configuration**: `App.js` line 140-153
- **Google Icon**: `App.js` line 177-184  
- **Sign In Function**: `signInWithGoogle()` in App.js
- **Login Button**: LoginPage component
- **Signup Button**: SignupPage component

---

## **Next Steps**

1. ✅ Test Google login locally
2. ✅ Set Vercel environment variables
3. ✅ Redeploy to production
4. ✅ Test on live site
5. ✅ Monitor console for errors

---

**Need help?** Check the browser console (F12 → Console) for detailed error messages.
