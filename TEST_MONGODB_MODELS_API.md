# MongoDB Models API Integration - Testing Guide

## ✅ Setup Confirmation
- MongoDB Models API Key: **Added to Render environment** ✓
- Backend Endpoints: **Deployed** ✓
- CSP Policy: **Fixed** ✓

---

## 🧪 Test 1: Check API Configuration

### Via curl:
```bash
curl https://hair-backend-2.onrender.com/api/models/health
```

### Expected Response (Success):
```json
{
  "status": "configured",
  "message": "MongoDB Models API is ready",
  "timestamp": "2026-03-21T12:34:56.789Z"
}
```

### Expected Response (Not Configured):
```json
{
  "status": "not-configured",
  "message": "MongoDB Models API key not configured",
  "timestamp": "2026-03-21T12:34:56.789Z"
}
```

---

## 🧪 Test 2: Generate Hair Care Recommendation

### Prerequisites:
1. You must be **logged in** (have a valid JWT token)
2. Token is in `localStorage.authToken` after login on your frontend

### Via curl:
```bash
curl -X POST https://hair-backend-2.onrender.com/api/models/recommend \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "hairType": "curly",
    "concerns": ["frizz", "dryness"],
    "preferredIngredients": ["argan oil", "shea butter"],
    "budget": "moderate"
  }'
```

### Expected Response (Success):
```json
{
  "success": true,
  "recommendation": {
    "products": [...],
    "routine": [...],
    "tips": [...]
  },
  "userEmail": "user@example.com"
}
```

### Expected Response (No Auth):
```json
{
  "error": "Unauthorized"
}
```

---

## 🧪 Test 3: Get Your JWT Token

### Step 1: Login at majorityhairsolutions.com/login
- Email: (your account)
- Password: (your password)

### Step 2: Open Browser Console (F12)
```javascript
// Copy your token from localStorage
console.log(localStorage.getItem('authToken'));
```

### Step 3: Use that token in the curl command above

---

## 🧪 Test 4: Verify User Data Saved

After generating a recommendation, check your MongoDB user document:

1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Browse your **hair_subscription** database
3. Find your user document
4. Look for `lastRecommendation` field containing:
   - Input parameters (hairType, concerns, etc.)
   - API result
   - Timestamp

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `"error": "MongoDB Models API Key not configured"` | Check Render dashboard → Environment variables → MONGODB_MODELS_API_KEY exists |
| `401 Unauthorized` | Your JWT token expired or invalid. Re-login at majorityhairsolutions.com |
| `"Failed to call MongoDB Model"` | API key is invalid. Generate a new one in MongoDB Atlas → Model API Keys |
| Empty recommendation result | Check MongoDB Models API documentation for model name and input format |

---

## 📝 Next Steps

1. ✅ Test `/api/models/health` endpoint
2. ✅ Login and get your JWT token
3. ✅ Call `/api/models/recommend` with your token
4. ✅ Verify recommendation saved to MongoDB
5. 🚀 (Optional) Create frontend UI for recommendations

---

## 💡 Integration Ideas

Once testing passes, you could add:
- **Recommendation Component** in React for `/recommend` page
- **AI-powered form** to collect user preferences
- **Store recommendations** in user profile
- **Subscription products** based on recommendations
