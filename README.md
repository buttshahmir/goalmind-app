# ⚽ GoalMind — FIFA World Cup 2026 AI Prediction App

AI-powered match predictions powered by Claude AI.

---

## 🚀 Vercel pe Deploy kaise karein (5 minutes)

### Option A — GitHub se (Recommended)

1. **GitHub pe jao** → [github.com](https://github.com) → New Repository
2. Repository name: `goalmind-app` → Create
3. Is poore folder ko upload karo (drag & drop)
4. **Vercel pe jao** → [vercel.com](https://vercel.com) → "Add New Project"
5. GitHub se `goalmind-app` select karo
6. Framework: **Vite** select karo
7. **Deploy** click karo — done! ✅

### Option B — Direct Upload

1. **Vercel pe jao** → [vercel.com](https://vercel.com)
2. "Add New Project" → "Deploy without Git"
3. Is poora folder drag & drop karo
4. Deploy! ✅

---

## 📱 Play Store ke liye (PWA → TWA)

App deploy hone ke baad:

### Step 1 — Bubblewrap install karo
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR-VERCEL-URL/manifest.json
bubblewrap build
```

### Step 2 — Play Console
1. [play.google.com/console](https://play.google.com/console) pe jao
2. $25 developer account banao
3. "Create App" → APK/AAB upload karo
4. Screenshots, description add karo
5. Submit for review → 2-7 din mein live!

---

## 🛠 Local Development

```bash
npm install
npm run dev
# App opens at http://localhost:3000
```

---

## 📁 Project Structure

```
goalmind-app/
├── index.html          # Entry point + PWA meta
├── vite.config.js      # Build config
├── package.json        # Dependencies
├── vercel.json         # Vercel routing
├── src/
│   ├── main.jsx        # React entry + SW register
│   └── App.jsx         # Main app (all screens)
└── public/
    ├── manifest.json   # PWA manifest
    ├── sw.js           # Service worker (offline)
    └── icon.svg        # App icon
```

---

## ⚠️ Important Notes

- App uses **Claude AI API** — already configured
- **PWA ready** — installable on Android + iOS
- **Offline support** — basic caching via service worker
- For Play Store, use **Bubblewrap** to generate TWA APK

---

Made with ❤️ + Claude AI
