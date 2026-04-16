# 📱 PWA Setup Guide - CampusConnect

Your app is now a **Progressive Web App (PWA)**! Here's everything you need to know.

---

## ✅ What's Been Added

### 1. **PWA Configuration** (`vite.config.ts`)
- ✅ Service Worker for offline support
- ✅ Automatic updates
- ✅ Asset caching
- ✅ API caching for Convex backend
- ✅ Font caching

### 2. **Web App Manifest** (`public/manifest.json`)
- ✅ App name and description
- ✅ Theme colors
- ✅ Display mode (standalone)
- ✅ App shortcuts
- ✅ Categories

### 3. **Install Prompt Component** (`src/components/InstallPWA.tsx`)
- ✅ Beautiful install banner
- ✅ Auto-shows after 10 seconds
- ✅ Dismissible (remembers choice)
- ✅ iOS and Android support

### 4. **PWA Meta Tags** (`index.html`)
- ✅ Theme color
- ✅ Apple mobile web app tags
- ✅ Viewport optimization
- ✅ Manifest link

---

## 🎨 Generate PWA Icons

### Step 1: Open Icon Generator
1. Open `generate-pwa-icons.html` in your browser
2. Click "Generate Both" button
3. Two PNG files will download:
   - `pwa-192x192.png`
   - `pwa-512x512.png`

### Step 2: Move Icons to Public Folder
```bash
# Move the downloaded icons to public folder
move pwa-192x192.png public/
move pwa-512x512.png public/
```

### Alternative: Use Your Own Icons
If you have custom icons:
1. Create 192x192px and 512x512px PNG images
2. Name them `pwa-192x192.png` and `pwa-512x512.png`
3. Place them in the `public/` folder

---

## 🚀 Testing Your PWA

### On Desktop (Chrome/Edge)
1. Run `npm run dev`
2. Open http://localhost:5173
3. Look for install icon in address bar (⊕ or ⬇)
4. Click to install
5. App opens in standalone window!

### On Android
1. Build and deploy your app
2. Open in Chrome
3. Tap menu (⋮) → "Install app" or "Add to Home Screen"
4. App icon appears on home screen
5. Opens like a native app!

### On iOS (iPhone/iPad)
1. Open in Safari
2. Tap Share button (□↑)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen!

---

## 🌐 Deploying Your PWA

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages
1. Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})
```

2. Build and deploy:
```bash
npm run build
# Push dist folder to gh-pages branch
```

---

## 📱 PWA Features

### ✅ Works Offline
- Service worker caches all assets
- API responses cached for 24 hours
- Works without internet after first visit

### ✅ Installable
- Add to home screen on mobile
- Standalone app window on desktop
- No app store required!

### ✅ Fast Loading
- Assets cached locally
- Instant subsequent loads
- Background updates

### ✅ App-Like Experience
- Full screen (no browser UI)
- Custom splash screen
- Native-like navigation

### ✅ Auto-Updates
- Service worker checks for updates
- Automatically downloads new version
- Prompts user to refresh

---

## 🎯 PWA Checklist

Before going live, ensure:

- [ ] Icons generated and placed in `public/`
- [ ] App tested on Chrome (desktop)
- [ ] App tested on Android Chrome
- [ ] App tested on iOS Safari
- [ ] Install prompt appears
- [ ] App works offline
- [ ] Service worker registered
- [ ] Manifest loads correctly
- [ ] Theme color matches design
- [ ] App shortcuts work

---

## 🔧 Customization

### Change Theme Color
Edit `vite.config.ts` and `index.html`:
```typescript
theme_color: '#YOUR_COLOR'
```

### Add More Shortcuts
Edit `vite.config.ts` manifest:
```typescript
shortcuts: [
  {
    name: 'Your Shortcut',
    url: '/your-path',
    icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
  }
]
```

### Modify Caching Strategy
Edit `vite.config.ts` workbox config:
```typescript
runtimeCaching: [
  {
    urlPattern: /your-pattern/,
    handler: 'NetworkFirst', // or 'CacheFirst', 'StaleWhileRevalidate'
    options: { /* ... */ }
  }
]
```

---

## 🐛 Troubleshooting

### Install Prompt Not Showing
- Clear browser cache
- Check console for errors
- Ensure HTTPS (required for PWA)
- Wait 10 seconds after page load

### Service Worker Not Registering
- Check browser console
- Ensure `vite-plugin-pwa` installed
- Verify `vite.config.ts` syntax
- Try hard refresh (Ctrl+Shift+R)

### Icons Not Loading
- Verify files in `public/` folder
- Check file names match manifest
- Clear cache and reload
- Check browser console for 404s

### Offline Mode Not Working
- Install app first
- Visit pages while online
- Then go offline and test
- Check service worker in DevTools

---

## 📊 PWA Audit

### Test with Lighthouse
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Aim for 100% score!

### Check PWA Criteria
- ✅ Served over HTTPS
- ✅ Responsive design
- ✅ Works offline
- ✅ Has manifest
- ✅ Has service worker
- ✅ Installable
- ✅ Fast loading

---

## 🎉 You're Done!

Your CampusConnect app is now a fully functional PWA!

### What Users Get:
- 📱 Install on any device
- ⚡ Lightning-fast loading
- 🔌 Works offline
- 🎨 Native app experience
- 🔄 Auto-updates
- 🚀 No app store needed

### Next Steps:
1. Generate icons (see above)
2. Test on mobile devices
3. Deploy to production
4. Share with users!

---

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox Guide](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

**Need Help?** Check the console for errors or refer to the documentation above.

**Enjoy your PWA! 🎊**
