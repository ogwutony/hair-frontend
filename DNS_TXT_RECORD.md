# DNS TXT Record for majorityhairsolutions.com

## TikTok Developer Verification

**Domain:** majorityhairsolutions.com  
**Record Type:** TXT  
**Name/Host:** @ (or leave blank, depending on your registrar)  
**Value:**
```
tiktok-developers-site-verification=76k8A1leTeGV4QWpdVYt1twEA7RB9Gl3
```

---

## How to Add This Record

### Option 1: GoDaddy
1. Go to [GoDaddy.com](https://godaddy.com) → Sign in
2. Navigate to **My Products** → **Domain Manager**
3. Find `majorityhairsolutions.com` → Click **Manage DNS**
4. Click **Add Record** → Select **TXT**
5. Enter:
   - **Name:** @ (or leave blank)
   - **Value:** `tiktok-developers-site-verification=76k8A1leTeGV4QWpdVYt1twEA7RB9Gl3`
6. Click **Save**

### Option 2: Namecheap
1. Go to [Namecheap.com](https://namecheap.com) → Sign in
2. Navigate to **Domain List** → Find `majorityhairsolutions.com`
3. Click **Manage** → **Advanced DNS**
4. Click **Add New Record** → Select **TXT Record**
5. Enter:
   - **Host:** @ (or .majorityhairsolutions.com)
   - **Value:** `tiktok-developers-site-verification=76k8A1leTeGV4QWpdVYt1twEA7RB9Gl3`
6. Click **Save**

### Option 3: Google Domains
1. Go to [Google Domains](https://domains.google.com) → Sign in
2. Select `majorityhairsolutions.com`
3. Navigate to **DNS** → **Custom Records**
4. Click **Create New Record**
5. Enter:
   - **Name:** @ (root domain)
   - **Type:** TXT
   - **Data:** `tiktok-developers-site-verification=76k8A1leTeGV4QWpdVYt1twEA7RB9Gl3`
6. Click **Create**

### Option 4: Other Registrars
1. Log into your domain registrar
2. Find **DNS Management** or **Advanced DNS**
3. Add a **TXT Record** with:
   - **Name:** @ or (domain root)
   - **Type:** TXT
   - **Value:** `tiktok-developers-site-verification=76k8A1leTeGV4QWpdVYt1twEA7RB9Gl3`

---

## After Adding the Record

- **Wait 24-48 hours** for DNS propagation
- Verify the record was added:
  ```bash
  nslookup -type=TXT majorityhairsolutions.com
  # or
  dig majorityhairsolutions.com TXT
  ```
- Return to TikTok Developers to complete verification

---

**Note:** DNS changes can take up to 48 hours to propagate globally, but usually appear within minutes to a few hours.
