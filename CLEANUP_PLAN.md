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
│   Deployed: Vercel (MOVING)         │      │   Deployed: Railway                 │
│   Status: ✅ Phase 1 done           │      │   Status: 2 months stale            │
└─────────────────────────────────────┘      └─────────────────────────────────────┘
         UI ONLY                                    ALL THE MATH
```

## Decision: Keep 2 Repos
- Simpler than monorepo migration
- Independent deployments
- Can revisit monorepo later if needed

## Decision: All Railway
- Moving frontend from Vercel → Railway
- Single platform, single billing, private networking possible
- Railway Pro account available

### Key Files in Backend (strava-tracks-analyzer)

| File | Purpose |
|------|---------|
| `api/main.py` | FastAPI REST endpoints (what Railway runs) |
| `core/calculations.py` | Main algorithm logic |
| `core/wind/` | Wind direction estimation |
| `core/segments/` | Track segmentation logic |
| `core/metrics.py` | Performance calculations (VMG, angles) |
| `core/gpx.py` | GPX file parsing |
| `app.py` | OLD Streamlit UI (legacy, probably unused) |

### API Endpoints (called by frontend)

- `GET /api/config` - Parameter defaults and ranges
- `POST /api/analyze-track` - Main analysis (upload GPX, get results)
- `GET /api/health` - Health check

---

## What Needs Work Where

### Frontend (foil-lab-web) - UI/UX issues
- [x] Type safety cleanup (DONE)
- [x] Dead code removal (DONE)
- [ ] Testing infrastructure (no tests exist)
- [ ] Better error handling for edge cases
- [ ] Polar plot edge cases (recent reverts suggest issues)

### Backend (strava-tracks-analyzer) - Algorithm issues
- [ ] Wind estimation accuracy/robustness
- [ ] Upwind angle calculation bugs
- [ ] Track segmentation logic
- [ ] Edge case handling (short tracks, bad GPS data)
- [ ] Code cleanup (has old Streamlit stuff mixed in)
- [ ] Testing (unknown status)
- [ ] Documentation

---

## Phase 1: Frontend Cleanup - COMPLETED

### 1.1 Remove Dead Documentation - DONE
- [x] `DEVELOPMENT_SETUP.md` - Deleted
- [x] `PHASE_1_IMPLEMENTATION.md` - Deleted
- [x] `REACT_MIGRATION_PLAN.md` - Deleted

### 1.2 Remove Dead/Duplicate Components - DONE
- [x] `components/AnalysisResults.tsx` - Deleted
- [x] `components/FileUpload.tsx` - Deleted

### 1.3 Remove Unused Dependencies - DONE
- [x] `recharts` - Removed from package.json
- [x] `zod` - Kept (for Phase 2 validation)

### 1.4 Fix Type Safety Issues - DONE
- [x] `uploadStore.ts` - `result` now typed as `AnalysisResult`
- [x] `ParameterControls.tsx` - `config` now typed as `ConfigResponse | undefined`
- [x] `SimpleLeafletMap.tsx` - Proper Leaflet types, replaced innerHTML with safe DOM methods
- [x] `FileUpload.tsx` - Proper react-dropzone types (`FileRejection`, `ErrorCode`)
- [x] `ComparisonView.tsx` - Fixed all possibly-undefined errors
- [x] `useApi.ts` - Fixed `queryKey` typing
- [x] `api-client.ts` - Changed `data?: any` to `data?: unknown`

### 1.5 Consolidate Duplicate Types - DONE
- [x] `TrackSegment` now imported from `api-client.ts` in analysisStore (removed duplicate)
- [x] `PerformanceMetrics` kept separate (camelCase in store vs snake_case in API - intentional)
- [x] Added clarifying comment about the intentional difference

### 1.6 Consolidate Parameter Defaults - DONE
- [x] Created `lib/defaults.ts` with `DEFAULT_PARAMETERS` and `DEFAULT_RANGES`
- [x] Updated `analysisStore.ts` to use centralized defaults
- [x] Updated `ParameterControls.tsx` to use centralized defaults
- [x] Updated `WindDirectionInput.tsx` to use centralized defaults
- [x] Updated `app/analyze/page.tsx` to use centralized defaults
- [x] Fixed inconsistency: minDistance was 75 in store, 100 in controls (now 100)
- [x] Fixed inconsistency: minDuration was 15 in store, 10 in controls (now 10)

---

## Phase 2: Robustness (Next)

### 2.1 GPX Validation
- Improve `lib/gpx-parser.ts` to validate required GPS fields
- Better error messages for invalid files
- Handle edge cases (empty tracks, single point, etc.)

### 2.2 Polar Plot Edge Cases
- Review recent revert history (commits 9a024d8, 9aa0dd5)
- Add proper handling for empty data, single-speed data
- Add unit tests for edge cases

### 2.3 API Response Validation
- Use Zod schemas to validate backend responses
- Graceful handling of unexpected response shapes

---

## Phase 3: Testing (Future)

### 3.1 Unit Testing Setup
- Set up Vitest + React Testing Library
- Add tests for critical logic (polar plot calculations, type conversions)

### 3.2 E2E Testing

> **NOTE**: Any Playwright references in this repo are OLD and likely WRONG.
> The docs reference `npm run test:e2e` commands that don't exist.
> This needs fresh research and design:
> - Research current Playwright + Next.js 15 best practices
> - Design test strategy from scratch
> - Implement upload → analyze → results flow tests

---

## Phase 4: Backend Overhaul (strava-tracks-analyzer)

> **This is a SEPARATE REPO** - work tracked here for context but executed there.

### 4.1 Assessment Needed
- [ ] Review algorithm code quality in `core/`
- [ ] Identify specific bugs in wind estimation
- [ ] Check test coverage (if any exists)
- [ ] Audit old Streamlit code - can `app.py` be removed?
- [ ] Review deployment setup on Railway

### 4.2 Potential Algorithm Improvements
- [ ] Wind estimation robustness (what are the known issues?)
- [ ] Upwind angle calculation accuracy
- [ ] Better handling of noisy GPS data
- [ ] Edge cases: short sessions, drifting, transitions

### 4.3 Code Cleanup
- [ ] Remove Streamlit remnants if not needed
- [ ] Consolidate duplicate/dead code
- [ ] Improve documentation
- [ ] Add/improve tests

### 4.4 Deployment
- [ ] Ensure Railway deployment is up to date
- [ ] Set up proper CI/CD if not exists
- [ ] Document deployment process

---

## Local Development Setup

### To test the full stack locally:

```bash
# Terminal 1: Backend (Python)
cd strava-tracks-analyzer
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000

# Terminal 2: Frontend (Next.js)
cd foil-lab-web
# Edit .env.local to point to localhost:8000
npm run dev
```

### Environment configs:

**foil-lab-web/.env.local** (for local dev):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

**foil-lab-web/.env.local** (for testing against prod backend):
```
NEXT_PUBLIC_API_URL=https://strava-tracks-analyzer-production.up.railway.app
NEXT_PUBLIC_APP_ENV=development
```

---

## Execution Order

```
1. [DONE] Frontend cleanup (Phase 1) - PR merged
2. [NEXT] Backend assessment & cleanup (strava-tracks-analyzer)
   - Explore code quality
   - Identify algorithm issues
   - Remove dead code (old Streamlit?)
   - Fix bugs
3. [THEN] Move frontend to Railway
   - Add foil-lab-web to Railway
   - Set env vars
   - Disconnect Vercel
4. [LATER] Frontend robustness & testing (Phase 2-3)
```

**Rationale:** Clean up backend first so we deploy good code, then consolidate to Railway.

---

## Phase 5: Railway Migration (after backend cleanup)

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

### 5.4 Cleanup
- Disconnect repo from Vercel
- Delete Vercel project
- Update any DNS if custom domain

---

## Status Summary

| Item | Status |
|------|--------|
| Frontend cleanup (Phase 1) | ✅ DONE - PR #1 merged |
| Backend assessment | 🔜 NEXT |
| Backend cleanup | 🔜 After assessment |
| Railway migration | 🔜 After backend cleanup |
| Frontend robustness (Phase 2) | ⏸️ Later |
| Frontend testing (Phase 3) | ⏸️ Later |
| Documentation (both repos) | ⚠️ Stale, needs update |

---

## Completed Work (This Session)

### Files Deleted
- `DEVELOPMENT_SETUP.md`, `PHASE_1_IMPLEMENTATION.md`, `REACT_MIGRATION_PLAN.md`
- `components/AnalysisResults.tsx`, `components/FileUpload.tsx`

### Files Created
- `lib/defaults.ts` - Centralized parameter defaults

### Files Modified
- Fixed type safety in 8+ files (0 `any` types remaining)
- Consolidated duplicate types and defaults
- `package.json` - Removed unused `recharts` dependency

### Current Branch
`cleanup/phase-1-type-safety` (uncommitted changes)
