# MongoDB Models API - Integration & Testing Guide

## 🎯 Current Status

✅ **Render Backend**: Deployed with Models API endpoints  
✅ **Environment Variable**: MONGODB_MODELS_API_KEY added to Render  
✅ **Vercel Frontend**: Fixed CSP policy, building now  
✅ **Test Component**: Ready to use  

---

## 🚀 Quick Start: Test the API Now

### Option 1: Test via Browser Console (Easiest)

1. **Login** at https://majorityhairsolutions.com/login
2. **Open Console** (F12 → Console tab)
3. **Copy & Run** this code:

```javascript
// Get your JWT token
const token = localStorage.getItem('authToken');

// Call the API
fetch('https://hair-backend-2.onrender.com/api/models/recommend', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    hairType: 'curly',
    concerns: ['frizz', 'dryness'],
    preferredIngredients: ['argan oil'],
    budget: 'moderate'
  })
})
.then(res => res.json())
.then(data => console.log('Success!', data))
.catch(err => console.error('Error:', err));
```

### Expected Output:
```json
{
  "success": true,
  "recommendation": { ... },
  "userEmail": "your@email.com"
}
```

---

### Option 2: Add Component to React App

1. **Copy** `HairRecommendationComponent.jsx` to your `src/` folder
2. **Import** in `App.js`:

```javascript
import HairRecommendationForm from './HairRecommendationComponent';
```

3. **Add Route** (inside `<Routes>`):

```javascript
<Route 
  path="/hair-recommendation" 
  element={
    isLoggedIn ? (
      <HairRecommendationForm 
        authToken={authToken}
        userEmail={userEmail}
        backendUrl="https://hair-backend-2.onrender.com"
      />
    ) : (
      <Navigate to="/login" />
    )
  } 
/>
```

4. **Add Navigation Link**:

```javascript
{isLoggedIn && (
  <Link to="/hair-recommendation" style={styles.navLink}>
    Get Recommendation
  </Link>
)}
```

---

## 🧪 Detailed Testing Steps

### Step 1: Verify API Configuration
```bash
# Check if MongoDB Models API is ready
curl https://hair-backend-2.onrender.com/api/models/health
```

**Should see:**
```json
{
  "status": "configured",
  "message": "MongoDB Models API is ready"
}
```

### Step 2: Login & Get JWT Token
1. Login at https://majorityhairsolutions.com/login
2. Browser console: `localStorage.getItem('authToken')`
3. Copy the token (long string starting with `ey...`)

### Step 3: Test Recommendation Endpoint
```bash
curl -X POST https://hair-backend-2.onrender.com/api/models/recommend \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "hairType": "curly",
    "concerns": ["frizz", "dryness"],
    "preferredIngredients": ["argan oil", "shea butter"],
    "budget": "moderate"
  }'
```

### Step 4: Verify Data Saved to MongoDB
1. Go to MongoDB Atlas
2. Database → hair_subscription → Users collection
3. Find your user document
4. Look for `lastRecommendation` field

---

## 📊 API Endpoints Reference

### `GET /api/models/health`
Check if MongoDB Models API is configured
- **Auth Required**: ❌ No
- **Response**: Configuration status

### `POST /api/models/recommend`
Generate personalized hair care recommendation
- **Auth Required**: ✅ Yes (Bearer token)
- **Request Body**:
  ```json
  {
    "hairType": "straight|wavy|curly|coily|unspecified",
    "concerns": ["frizz", "dryness", ...],
    "preferredIngredients": ["argan oil", ...],
    "budget": "budget|moderate|premium|luxury"
  }
  ```
- **Response**: Saves to user profile + returns recommendation

### `POST /api/models/call`
Generic MongoDB Models API invocation
- **Auth Required**: ✅ Yes (Bearer token)
- **Request Body**:
  ```json
  {
    "modelId": "your-model-id",
    "inputs": { ... }
  }
  ```
- **Response**: Raw model output

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| **401 Unauthorized** | Re-login. Your token expired or is invalid. |
| **Token not found** | Check `localStorage.getItem('authToken')` in browser console |
| **"API Key not configured"** | Go to Render → hair-backend-2 → Settings → Verify MONGODB_MODELS_API_KEY exists |
| **Empty response** | The MongoDB Models API might be processing. Check Render logs. |
| **CORS error** | Your browser might be blocking requests. Check browser console for details. |

---

## 📝 Files Added to Your Project

1. **TEST_MONGODB_MODELS_API.md** - Detailed testing guide (this file)
2. **HairRecommendationComponent.jsx** - Ready-to-use React component
3. **Backend Endpoints** - `/api/models/recommend`, `/api/models/health`, `/api/models/call`

---

## ✨ Next Steps

- [ ] Test via browser console (Option 1)
- [ ] Add component to React app (Option 2)
- [ ] Create `/hair-recommendation` route
- [ ] Add navigation link
- [ ] Deploy to Vercel (`git push`)
- [ ] Test full workflow end-to-end

---

## 📞 Support

If you encounter any issues:
1. Check Render logs: Dashboard → hair-backend-2 → Logs
2. Check Vercel logs: Dashboard → majority-hair-frontend → Deployments
3. Verify MongoDB connection: MongoDB Atlas → Database
4. Test API directly with curl commands above

Happy hair recommendations! 💇‍♀️✨
