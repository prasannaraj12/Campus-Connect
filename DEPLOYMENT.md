# 🚀 Deployment Guide - CampusConnect

Your code is now on GitHub! Here's how to deploy it.

**GitHub Repository**: https://github.com/prasannaraj12/Campus-Connect

---

## 🌐 Deploy to Vercel (Recommended)

### Method 1: Via Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository**
   - Click "Import Git Repository"
   - Select: `prasannaraj12/Campus-Connect`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_CONVEX_URL = https://diligent-jellyfish-837.convex.cloud
   ```
   (Get this from your `.env.local` file)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your live URL! 🎉

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to GitHub repo
vercel link

# Add environment variable
vercel env add VITE_CONVEX_URL

# Deploy
vercel --prod
```

---

## 🎯 Deploy to Netlify

### Method 1: Via Netlify Dashboard

1. **Go to Netlify**
   - Visit: https://app.netlify.com/start
   - Sign in with GitHub

2. **Import Repository**
   - Click "Import from Git"
   - Select GitHub
   - Choose: `prasannaraj12/Campus-Connect`

3. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (leave empty)

4. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `VITE_CONVEX_URL` = `https://diligent-jellyfish-837.convex.cloud`

5. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes
   - Get your live URL! 🎉

### Method 2: Via Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Link to GitHub repo
netlify link

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

---

## 📱 After Deployment

### 1. Test Your Live Site
- Open the URL on desktop
- Open on mobile
- Test all features

### 2. Test PWA Installation
- **Android**: Chrome → Menu → "Install app"
- **iOS**: Safari → Share → "Add to Home Screen"
- **Desktop**: Click install icon in address bar

### 3. Verify Features
- ✅ Events load correctly
- ✅ Registration works
- ✅ QR codes generate
- ✅ Install prompt appears (after 10 seconds)
- ✅ Offline mode works (after install)
- ✅ Service worker registered

---

## 🔧 Environment Variables

You need to set these in your deployment platform:

```env
VITE_CONVEX_URL=https://diligent-jellyfish-837.convex.cloud
```

### Where to Find Your Convex URL:
```bash
# Check your local .env.local file
type .env.local
```

Or check Convex dashboard: https://dashboard.convex.dev

---

## 🎨 Custom Domain (Optional)

### On Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### On Netlify:
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records
4. SSL certificate auto-provisions

---

## 🔄 Automatic Deployments

Both Vercel and Netlify automatically deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Automatically triggers deployment! 🚀
```

---

## 📊 Monitor Your Deployment

### Vercel:
- Dashboard: https://vercel.com/dashboard
- Analytics: Built-in
- Logs: Real-time in dashboard

### Netlify:
- Dashboard: https://app.netlify.com
- Analytics: Available (paid)
- Logs: Deploy logs in dashboard

---

## 🐛 Troubleshooting

### Build Fails?
- Check environment variables are set
- Verify `VITE_CONVEX_URL` is correct
- Check build logs for errors

### PWA Not Installing?
- Ensure site is on HTTPS (automatic on Vercel/Netlify)
- Check manifest.json loads correctly
- Verify service worker registers (DevTools → Application)

### Offline Mode Not Working?
- Install the app first
- Visit pages while online
- Then test offline
- Check service worker in DevTools

---

## 🎯 Next Steps

After deployment:

1. **Share Your URL**
   - Share with users
   - Add to social media
   - Create QR code for easy access

2. **Monitor Usage**
   - Check analytics
   - Monitor errors
   - Gather user feedback

3. **Iterate**
   - Fix bugs
   - Add features
   - Push updates (auto-deploys!)

---

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Convex Docs**: https://docs.convex.dev
- **PWA Docs**: https://web.dev/progressive-web-apps/

---

## ✅ Deployment Checklist

Before going live:

- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] Build succeeds locally (`npm run build`)
- [ ] PWA icons generated and in `public/` folder
- [ ] Convex backend is running
- [ ] Test on desktop browser
- [ ] Test on mobile browser
- [ ] Test PWA installation
- [ ] Test offline mode
- [ ] Verify all features work
- [ ] Check Lighthouse score (aim for 100%)

---

**Your app is ready to deploy! Choose Vercel or Netlify and follow the steps above.** 🚀

**Live URL will be**: `https://campus-connect-xyz.vercel.app` or `https://campus-connect-xyz.netlify.app`
