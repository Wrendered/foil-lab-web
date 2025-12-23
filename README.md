# Foil Lab Web - Sailing Track Analysis UI

A modern React/Next.js frontend for analyzing wingfoil and sailing GPS tracks with real-time performance metrics, VMG highlighting, and multi-track comparison.

## 🚀 Quick Start

### Development Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/Wrendered/foil-lab-web.git
   cd foil-lab-web
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

## 🌐 Deployment Guide

### Option 1: Vercel (Recommended)

**Via GitHub (Easiest):**
1. Push code to GitHub (already done!)
2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click "New Project"
5. Import `foil-lab-web` repository
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://strava-tracks-analyzer-production.up.railway.app
   NEXT_PUBLIC_APP_ENV=production
   ```
7. Click "Deploy"

**Via CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and set environment variables
```

Your site will be live at: `https://foil-lab-web.vercel.app`

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

### Option 3: Railway (Same platform as backend)

1. Go to [railway.app](https://railway.app)
2. New Service → GitHub Repo → Select `foil-lab-web`
3. Set environment variables
4. Auto-deploys on push

## 🔧 Backend Setup (Railway)

Your backend API is already deployed at:
```
https://strava-tracks-analyzer-production.up.railway.app
```

**To access your Railway dashboard:**
1. Go to [railway.app](https://railway.app)
2. Sign in with the same GitHub account
3. You should see your `strava-tracks-analyzer` project
4. The backend provides the API that this frontend connects to

**Backend Repository:**
- Location: `../strava-tracks-analyzer/` (parent directory)
- Contains: Python FastAPI backend with GPX processing
- Endpoints: `/api/analyze-track`, `/api/config`, `/api/health`

## 📁 Project Structure

```
foil-lab-web/
├── app/                    # Next.js App Router pages
│   ├── analyze/           # Main analysis interface
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── SimpleLeafletMap.tsx     # Interactive map
│   ├── TrackNavigator.tsx       # Multi-track tabs
│   ├── ComparisonView.tsx       # Track comparison
│   └── SimpleAnalysisResults.tsx # Results display
├── features/             # Feature-specific components
│   └── track-analysis/   # File upload and controls
├── stores/               # Zustand state management
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API client
└── public/               # Static assets
```

## 🛠 Environment Variables

### Required for Production:
```env
NEXT_PUBLIC_API_URL=https://strava-tracks-analyzer-production.up.railway.app
NEXT_PUBLIC_APP_ENV=production
```

### Development:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

### Optional Features:
```env
NEXT_PUBLIC_ENABLE_WIND_LINES=true
NEXT_PUBLIC_ENABLE_VMG_HIGHLIGHT=true
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 🎯 Key Features

- **Multi-file Upload**: Drag & drop multiple GPX files
- **Interactive Maps**: Leaflet-based track visualization
- **VMG Highlighting**: Real-time velocity made good analysis
- **Track Comparison**: Side-by-side performance metrics
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Parameter changes update instantly

## 🔄 Development Workflow

1. **Make changes** to components/pages
2. **Test locally** with `npm run dev`
3. **Commit changes** to git
4. **Push to GitHub** - auto-deploys to Vercel
5. **Share the live URL** with others

## 📊 Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Maps**: Leaflet
- **Charts**: Custom SVG (SimplePolarPlot)
- **API**: React Query
- **Deployment**: Vercel

## 🚨 Troubleshooting

### Map tiles loading slowly:
- This is a known issue with OpenStreetMap tiles
- Tiles eventually load but can take 30+ seconds
- All functionality works while waiting

### CORS errors:
- Check that `NEXT_PUBLIC_API_URL` points to your Railway backend
- Ensure backend is running and accessible

### Build errors:
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## 🔗 Related Links

- **Backend Repository**: `../strava-tracks-analyzer/`
- **Live Backend API**: https://strava-tracks-analyzer-production.up.railway.app
- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com/dashboard

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Ensure backend API is responding at `/api/health`
3. Verify environment variables are set correctly
4. Check Railway backend logs if API calls fail

---

## 🎉 Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created/logged in
- [ ] Repository imported to Vercel
- [ ] Environment variable `NEXT_PUBLIC_API_URL` set
- [ ] Deployment successful
- [ ] Site accessible via Vercel URL
- [ ] Test file upload and analysis
- [ ] Share URL with others!