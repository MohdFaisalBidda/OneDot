# R2 Public Access Setup Guide

## Issue
You're seeing an authorization error when trying to access uploaded images:
```xml
<Error>
<Code>InvalidArgument</Code>
<Message>Authorization</Message>
</Error>
```

This happens because R2 buckets are **private by default**. To display images directly in your app, you need to enable public access.

## Solution: Enable Public Access on R2

### Step 1: Enable Public Access on Your R2 Bucket

1. **Go to Cloudflare Dashboard**
   - Navigate to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click on **R2** in the left sidebar

2. **Select Your Bucket**
   - Click on your bucket name (e.g., `clarity-log-bucket`)

3. **Go to Settings**
   - Click on the **Settings** tab at the top

4. **Enable Public Access**
   - Scroll down to the **Public Access** section
   - Click the **"Allow Access"** button
   - A confirmation dialog will appear - click **"Allow"**

5. **Copy the Public Bucket URL**
   - After enabling, you'll see a **Public Bucket URL**
   - It will look like: `https://pub-xxxxxxxxxxxxx.r2.dev`
   - **Copy this URL** - you'll need it in the next step

### Step 2: Configure Your Environment Variable

1. **Open your `.env` or `.env.local` file**

2. **Add the Public URL**
   ```env
   CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
   ```
   Replace `xxxxxxxxxxxxx` with your actual public bucket URL

3. **Save the file**

4. **Restart your development server**
   ```bash
   # Stop your server (Ctrl+C)
   npm run dev
   # or
   yarn dev
   ```

### Step 3: Verify It Works

1. **Upload a new image** through your app
2. **Check the image URL** - it should now use your public URL:
   ```
   https://pub-xxxxxxxxxxxxx.r2.dev/user@email.com/focus/filename.jpg
   ```
3. **The image should display** without any authorization errors

## Alternative: Use a Custom Domain (Optional)

If you want to use your own domain instead of the `pub-xxxxx.r2.dev` URL:

### Step 1: Connect a Custom Domain

1. **In your R2 bucket settings**, scroll to **"Custom Domains"**

2. **Click "Connect Domain"**

3. **Enter your domain or subdomain**
   - Example: `cdn.yourdomain.com` or `images.yourdomain.com`

4. **Follow the DNS setup instructions**
   - Add the CNAME record to your domain's DNS settings
   - Wait for DNS propagation (can take a few minutes to hours)

5. **Verify the domain is connected**
   - Cloudflare will show a green checkmark when ready

### Step 2: Update Environment Variable

```env
CLOUDFLARE_R2_PUBLIC_URL=https://cdn.yourdomain.com
```

## Verify Your Configuration

### Check if Public Access is Enabled

Try accessing a file directly in your browser:
```
https://your-public-url.r2.dev/user@email.com/focus/test-image.jpg
```

- ✅ **If you see the image**: Public access is working!
- ❌ **If you see XML error**: Public access is not enabled or URL is incorrect

### Check Environment Variable

In your terminal where you run the server:
```bash
echo $CLOUDFLARE_R2_PUBLIC_URL
```

It should output your public URL. If it's empty, the variable isn't set.

## Security Considerations

### Public vs Private Files

**Public Access enabled means:**
- ✅ Anyone with the URL can view the files
- ✅ No authentication required
- ✅ Perfect for user-uploaded images, avatars, public documents
- ⚠️ All files in the bucket become publicly accessible

**Best Practices:**
1. **Don't store sensitive data** in public buckets
2. **Use separate buckets** for public and private files
3. **Use user-specific folders** (already implemented: `user@email.com/...`)
4. **Implement file name obfuscation** (already implemented: timestamp + random string)

### Recommended Bucket Structure

```
Public Bucket (public access enabled)
└── user@email.com/
    ├── focus/
    │   └── 1234567890-abc123-image.jpg
    ├── decisions/
    │   └── 1234567891-def456-chart.png
    └── profile/
        └── 1234567892-ghi789-avatar.jpg

Private Bucket (no public access)
└── user@email.com/
    ├── documents/
    └── private-data/
```

## Troubleshooting

### Error: "Authorization" when accessing images

**Cause:** Public access is not enabled on your R2 bucket.

**Solution:** Follow Step 1 above to enable public access.

### Error: Images show but with wrong URL

**Cause:** `CLOUDFLARE_R2_PUBLIC_URL` is not set or incorrect.

**Solution:**
1. Check your `.env` file has the correct public URL
2. Restart your server
3. Re-upload a test image

### Error: "Invalid Bucket URL"

**Cause:** You might have added extra spaces or wrong URL format.

**Solution:** Make sure the URL:
- Starts with `https://`
- Ends with `.r2.dev` (or your custom domain)
- Has no trailing slash
- Has no spaces

Example: `CLOUDFLARE_R2_PUBLIC_URL=https://pub-abc123.r2.dev`

### Old images don't work but new ones do

**Cause:** Old images were uploaded before public access was enabled.

**Solution:**
- Existing images in the bucket become public when you enable public access
- Just make sure you're using the correct public URL
- You may need to update old database entries with the new public URL format

## Complete Environment Variables

Your `.env` or `.env.local` should have:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name

# REQUIRED: Public URL for accessing uploaded files
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
```

## Testing Checklist

After setup, verify:

- [ ] Public access enabled on R2 bucket
- [ ] `CLOUDFLARE_R2_PUBLIC_URL` set in `.env`
- [ ] Server restarted after adding environment variable
- [ ] Test upload shows image without errors
- [ ] Image URL starts with your public bucket URL
- [ ] Can access image directly in browser by copying URL

## Need More Help?

If you're still having issues:

1. **Check the server console** for the warning message with detailed instructions
2. **Verify your Cloudflare R2 dashboard** shows "Public Access: Enabled"
3. **Test with a simple curl command**:
   ```bash
   curl https://your-public-url.r2.dev/test.jpg
   ```
4. **Check your DNS** if using a custom domain (can take up to 24 hours to propagate)

---

**Note:** This setup provides permanent public URLs. Files uploaded with this configuration will be accessible as long as the file exists in R2 and public access remains enabled.
