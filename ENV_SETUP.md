# Quick Setup Guide - Environment Variables

## 🚀 For Local Development

Copy your existing `.env` file to `.env.local` and add the Cloudinary credentials:

```bash
# Copy existing env file
cp .env .env.local
```

Then add these lines to `.env.local`:

```bash
# Cloudinary Configuration (REQUIRED for image uploads)
CLOUDINARY_CLOUD_NAME=dn7ucxk8a
CLOUDINARY_API_KEY=246184425446679
CLOUDINARY_API_SECRET=oNE1GqwM-WYb_REcNFr39eqwCY0
```

## 🌐 For Production Deployment

### Vercel

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add each variable from `.env.example`
4. Make sure to add `CLOUDINARY_API_SECRET` - this is **REQUIRED**

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Set environment variables:

```bash
firebase functions:config:set \
  cloudinary.cloud_name="dn7ucxk8a" \
  cloudinary.api_key="246184425446679" \
  cloudinary.api_secret="oNE1GqwM-WYb_REcNFr39eqwCY0"
```

## ⚠️ Important Notes

- **Never commit** `.env.local` or `.env` to version control
- The `.env.example` file is safe to commit (contains no real secrets)
- Cloudinary `API_SECRET` is **REQUIRED** for the app to function
- Firebase config variables are optional (have fallback values)

## 🔒 Security Reminder

If you've previously committed the Cloudinary credentials to Git:
1. **Rotate your API keys** at https://cloudinary.com/console
2. Update the new keys in your environment variables
3. Never commit the real values again

## ✅ Verify Setup

Run the development server to test:

```bash
npm run dev
```

If Cloudinary uploads work, your environment is configured correctly!
