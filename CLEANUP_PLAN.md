# Foil Lab - Cleanup & Improvement Plan

> **DELETE THIS FILE BEFORE MERGE** - This is a working document for cleanup tasks only.

---

## System Architecture

```
┌─────────────────────────────────────┐      ┌─────────────────────────────────────┐
│   foil-lab-web                      │      │   strava-tracks-analyzer            │
│   Next.js Frontend                  │ ───► │   Python Backend                    │
│                                     │      │                                     │
│   • File upload UI                  │      │   • GPX parsing (core/gpx.py)       │
│   • Parameter controls              │      │   • Wind estimation (core/wind/)    │
│   • Map visualization               │      │   • Track segmentation              │
│   • Polar plots                     │      │   • VMG & angle calculations        │
│   • Comparison views                │      │   • Performance metrics             │
│                                     │      │                                     │
│   Deployed: Vercel                  │      │   Deployed: Railway                 │
│   Status: ✅ Phase 1 done           │      │   Status: ✅ Cleaned up             │
└─────────────────────────────────────┘      └─────────────────────────────────────┘
         UI ONLY                                    ALL THE MATH
```

## Decisions Made

### Keep 2 Repos
- Simpler than monorepo migration
- Independent deployments
- Can revisit monorepo later if needed

### Deployment Strategy
- **Backend**: Railway (already deployed, working)
- **Frontend**: Currently Vercel, considering Railway migration for unified platform

### Current URLs
- **Frontend (Vercel)**: https://foil-lab-web.vercel.app
- **Backend (Railway)**: https://strava-tracks-analyzer-production.up.railway.app

---

## Completed Work

### Phase 1: Frontend Cleanup ✅ DONE
- Removed dead documentation files
- Removed dead/duplicate components
- Fixed all type safety issues (0 `any` types)
- Consolidated duplicate types
- Centralized parameter defaults in `lib/defaults.ts`
- Removed unused dependencies

### Phase 4: Backend Cleanup ✅ DONE

**Total deleted: ~12,750 lines**

**Round 1 - Streamlit & Algorithm Cleanup (6,988 lines):**
- Removed entire Streamlit UI (`app.py`, `ui/` folder)
- Consolidated 7 wind functions → 2 (iterative + weighted)
- Removed duplicate code (GPX parser, state manager, visualization)
- Verified iterative algorithm is the correct approach

**Round 2 - Dead Code & Docs Cleanup (2,060 lines):**
- Deleted `adapters/` folder (empty after Streamlit removal)
- Deleted unused services (`interfaces.py`, `wind_analysis.py`, `segment_analysis.py`)
- Deleted unused utils (`analysis.py`, `calculations.py`, `errors.py`, `validation.py`, `parameter_scaling.py`)
- Fixed typo file (`__init__,py`)

**Round 3 - Documentation Cleanup (3,700 lines):**
- Deleted 14 stale planning/migration docs
- Rewrote `CLAUDE.md` for API-only architecture
- Rewrote `README.md` with current structure
- Updated `docs/architecture.md`
- Updated `docs/DEPLOYMENT-GUIDE.md`

**Current Backend Stats:**
- 35 Python files
- 5,911 lines of code
- Clean, documented, no cruft

---

## Current Status

| Item | Status |
|------|--------|
| Frontend cleanup (Phase 1) | ✅ DONE |
| Backend cleanup (Phase 4) | ✅ DONE - 12,750 lines deleted |
| Wind algorithm evaluation | ✅ DONE - Iterative is correct |
| Backend PR merged | ✅ DONE |
| Railway migration | 🔜 NEXT |
| Frontend robustness (Phase 2) | ⏸️ Later |
| Frontend testing (Phase 3) | ⏸️ Later |
| Backend testing | ⏸️ Later (4% coverage) |

---

## Next: Railway Migration (Phase 5)

### 5.1 Add Frontend to Railway
- Railway Dashboard → New Service → GitHub Repo → foil-lab-web
- Railway auto-detects Next.js

### 5.2 Environment Variables
```
NEXT_PUBLIC_API_URL=https://strava-tracks-analyzer-production.up.railway.app
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_WIND_LINES=true
NEXT_PUBLIC_ENABLE_VMG_HIGHLIGHT=true
```

### 5.3 Optional: Private Networking
- Once both on Railway, can use internal URLs
- `NEXT_PUBLIC_API_URL=http://strava-tracks-analyzer.railway.internal`
- Faster, more secure

### 5.4 Vercel Handling
- Keep Vercel free tier running
- Update to redirect/link to Railway URL
- Don't delete - just point users to new location

---

## Future Work

### Phase 2: Frontend Robustness
- [ ] GPX validation improvements
- [ ] Polar plot edge cases
- [ ] API response validation with Zod

### Phase 3: Frontend Testing
- [ ] Set up Vitest + React Testing Library
- [ ] E2E testing with Playwright

### Backend Testing
- [ ] Increase from 4% coverage
- [ ] Add API endpoint tests
- [ ] Add CI/CD

---

## Local Development

```bash
# Terminal 1: Backend
cd strava-tracks-analyzer
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python run_api.py  # http://localhost:8000

# Terminal 2: Frontend
cd foil-lab-web
npm install
# Set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
npm run dev  # http://localhost:3000
```
