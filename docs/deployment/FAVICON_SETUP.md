# 🎨 Favicon Setup Instructions

## Quick Steps to Add Your University Logo as Favicon

### Step 1: Convert Your Logo

1. **Open the converter tool**:
   - Open `public/convert-favicon.html` in your browser
   - Or run: `start public\convert-favicon.html`

2. **Upload your logo**:
   - Click the upload area
   - Select your university logo image
   - The tool will generate 3 favicon sizes

3. **Download the favicons**:
   - Click "Download All Favicons"
   - You'll get 3 files:
     - `favicon-16x16.png` (browser tab)
     - `favicon-32x32.png` (bookmarks)
     - `apple-touch-icon.png` (iOS home screen)

### Step 2: Move Files to Public Folder

Move the downloaded files to your `public/` folder:

```bash
# Windows
move Downloads\favicon-16x16.png public\
move Downloads\favicon-32x32.png public\
move Downloads\apple-touch-icon.png public\
```

### Step 3: Verify

Your `public/` folder should now have:
```
public/
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── manifest.json
└── ...
```

### Step 4: Test

1. **Restart dev server**:
   ```bash
   npm run dev
   ```

2. **Open in browser**:
   - Go to http://localhost:5173
   - Check browser tab - you should see your logo!

3. **Clear cache if needed**:
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

---

## ✅ What's Already Done

- ✅ `index.html` updated with favicon links
- ✅ Favicon converter tool created
- ✅ PWA manifest ready for icons

---

## 🎯 After Adding Favicons

Your logo will appear:
- ✅ Browser tabs
- ✅ Bookmarks
- ✅ iOS home screen (when installed as PWA)
- ✅ Android home screen (when installed as PWA)

---

## 🔧 Manual Method (Alternative)

If you prefer to create favicons manually:

1. **Use an online tool**:
   - https://favicon.io/favicon-converter/
   - https://realfavicongenerator.net/

2. **Upload your logo**

3. **Download the generated files**

4. **Move to `public/` folder**

---

## 📱 For PWA Icons

To use your logo for PWA (home screen icons):

1. Create larger versions:
   - 192x192px → `pwa-192x192.png`
   - 512x512px → `pwa-512x512.png`

2. Use the icon generator:
   - Open `public/generate-pwa-icons.html`
   - Or use online tools

3. Move to `public/` folder

---

## 🎨 Tips for Best Results

- **Use PNG format** with transparent background
- **Square aspect ratio** works best
- **High resolution** source image (at least 512x512px)
- **Simple design** - complex logos may not be visible at small sizes
- **Good contrast** - ensure logo is visible on light/dark backgrounds

---

**Ready to add your favicon? Open `public/convert-favicon.html` in your browser!** 🎨
