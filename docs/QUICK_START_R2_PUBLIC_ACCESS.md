# 🚀 Quick Start: Fix Image Authorization Error

## 3-Step Fix

### 1️⃣ Enable Public Access (2 minutes)

Go to: [Cloudflare Dashboard → R2 → Your Bucket → Settings](https://dash.cloudflare.com)

Click **"Allow Access"** in the Public Access section

Copy the URL that appears (looks like `https://pub-xxxxxxxxxxxxx.r2.dev`)

### 2️⃣ Add Environment Variable (30 seconds)

Add this to your `.env` or `.env.local` file:

```env
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
```

Replace `xxxxxxxxxxxxx` with your actual URL from step 1.

### 3️⃣ Restart Server (10 seconds)

Stop your server and start it again:

```bash
# Press Ctrl+C to stop, then:
npm run dev
```

## ✅ Test It

Upload a new image and it should work!

---

**Full details:** See [R2_PUBLIC_ACCESS_SETUP.md](./R2_PUBLIC_ACCESS_SETUP.md)
