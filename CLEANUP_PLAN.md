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

### Current URLs
- **Frontend (Vercel - keeping)**: https://foil-lab-web.vercel.app
- **Backend (Railway)**: https://strava-tracks-analyzer-production.up.railway.app

> **NOTE**: Keep Vercel free tier running with redirect/link to new Railway app after migration.

### Key Files in Backend (strava-tracks-analyzer)

| File | Purpose |
|------|---------|
| `api/main.py` | FastAPI REST endpoints (what Railway runs) |
| `core/calculations.py` | Main algorithm logic |
| `core/wind/` | Wind direction estimation |
| `core/segments/` | Track segmentation logic |
| `core/metrics.py` | Performance calculations (VMG, angles) |
| `core/gpx.py` | GPX file parsing |
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
- [x] Wind estimation accuracy/robustness - **VERIFIED: Iterative algorithm is correct**
- [ ] Upwind angle calculation bugs - investigate if still present
- [ ] Track segmentation logic - review
- [ ] Edge case handling (short tracks, bad GPS data)
- [x] Code cleanup (removed Streamlit, consolidated wind) - **DONE: 6,988 lines deleted**
- [ ] Testing (only 4% coverage - needs improvement)
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

## Phase 4: Backend Overhaul (strava-tracks-analyzer) - COMPLETED

> **This is a SEPARATE REPO** - Branch: `cleanup/remove-streamlit-consolidate-wind`

### 4.1 Cleanup Complete - 6,988 Lines Deleted!

**Files Removed:**
- `app.py` - Streamlit entry point
- `ui/` - Complete folder (2,700+ LOC of Streamlit components)
- `adapters/streamlit_state.py`, `adapters/memory_state.py`
- `services/state.py`, `services/segment_service.py`
- `utils/state_manager.py`, `utils/visualization.py`, `utils/gpx_parser.py`
- `core/wind/direction.py`, `core/wind/estimate.py`, `core/wind/estimator.py`
- `core/wind_estimation_helpers.py`
- `.streamlit/config.toml`

**Files Simplified:**
- `core/wind/factory.py` - Now only 2 methods (iterative, weighted)
- `services/wind_service.py` - Removed state dependencies
- `api/main.py` - Removed unused state registration
- `requirements.txt` - Removed 20+ unused packages

### 4.2 Original Assessment - Score: 5.3/10

**Repository Stats:**
- 70 Python files, ~14,300 LOC
- Only 601 LOC of tests (~4% coverage)
- 2,700+ LOC of legacy Streamlit UI

### 4.2 Critical Issues Found

#### Wind Estimation Chaos (7 functions across 5 files!)
```
core/wind/direction.py      - estimate_wind_direction_from_upwind_tacks() (496 LOC)
core/wind/algorithms.py     - estimate_wind_direction_iterative() (453 LOC)
core/wind/algorithms.py     - estimate_wind_direction_weighted()
core/wind/factory.py        - estimate_wind_direction_factory()
core/wind/estimate.py       - estimate_wind_direction()
core/wind_estimation_helpers.py - estimate_wind_from_tacks()
core/metrics_advanced.py    - estimate_wind_direction_weighted() (DUPLICATE!)
```
**Problem**: Unclear which function is the source of truth. Multiple implementations.

#### Duplicate Code
| Area | Files | Issue |
|------|-------|-------|
| Visualization | `ui/components/visualization.py` + `utils/visualization.py` | Two modules, 782 LOC total |
| Segments | `segment_analysis.py` + `segment_service.py` | Overlapping responsibility |
| GPX Parsing | `core/gpx.py` + `utils/gpx_parser.py` | Two parsers |
| State | `services/state.py` + `utils/state_manager.py` | Legacy + new |

#### Test Coverage Crisis
- Only wind module has tests (3 files)
- ZERO tests for: segments, GPX parsing, metrics, API endpoints
- No pytest.ini, no CI/CD

#### Legacy Streamlit Code
- `app.py` (256 LOC) - still the entry point
- `ui/` directory - 2,700+ LOC of components
- Decision needed: sunset or maintain parallel?

### 4.3 Cleanup Priorities

**Immediate (before Railway migration):**
- [ ] Consolidate wind estimation (7 functions → 1-2)
- [ ] Remove duplicate visualization module
- [ ] Remove legacy state manager (`utils/state_manager.py`)
- [ ] Add .env support for configuration
- [ ] Decide on Streamlit: remove or keep?

**Short-term:**
- [ ] Consolidate segment services
- [ ] Remove duplicate GPX parser
- [ ] Add 50+ unit tests for core algorithms
- [ ] Add API endpoint tests
- [ ] Add Dockerfile

**Medium-term:**
- [ ] Add CI/CD (GitHub Actions)
- [ ] Increase test coverage to 80%+
- [ ] Performance: reduce 57 `.copy()` operations on dataframes
- [ ] Add caching strategy

### 4.4 Files to Likely Delete
- `utils/state_manager.py` - legacy state management
- `utils/gpx_parser.py` - duplicate of `core/gpx.py`
- One of: `ui/components/visualization.py` OR `utils/visualization.py`
- Possibly entire `ui/` folder if sunsetting Streamlit

### 4.5 Deployment Status
- Railway deployment exists and works
- No Dockerfile in repo
- No `railway.toml` config file
- No CI/CD pipeline visible

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
2. [DONE] Backend assessment - Score 5.3/10, critical issues identified
3. [DONE] Backend cleanup (strava-tracks-analyzer) - 6,988 lines deleted!
   ✓ Removed Streamlit entirely
   ✓ Consolidated 7 wind functions → 2 (iterative + weighted)
   ✓ Removed duplicate code (visualization, GPX parser, state manager)
   ✓ Verified iterative algorithm is the correct approach
4. [NEXT] Move frontend to Railway
   - Merge backend cleanup PR first
   - Add foil-lab-web to Railway
   - Set env vars
   - Keep Vercel with redirect to Railway
5. [LATER] Frontend robustness & testing (Phase 2-3)
6. [LATER] Backend testing (only 4% coverage)
```

**Backend cleanup branch:** `cleanup/remove-streamlit-consolidate-wind` in strava-tracks-analyzer

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

### 5.4 Vercel Handling
- Keep Vercel free tier running (https://foil-lab-web.vercel.app)
- Update Vercel app to redirect/link to Railway URL
- Don't delete - just point users to new location

---

## Status Summary

| Item | Status |
|------|--------|
| Frontend cleanup (Phase 1) | ✅ DONE - PR #1 merged |
| Backend assessment | ✅ DONE - Score 5.3/10, see Phase 4 |
| Backend cleanup | ✅ DONE - 6,988 lines deleted, branch ready |
| Wind algorithm evaluation | ✅ DONE - Iterative is the correct approach |
| Railway migration | 🔜 NEXT |
| Frontend robustness (Phase 2) | ⏸️ Later |
| Frontend testing (Phase 3) | ⏸️ Later |
| Backend testing | ⏸️ Later (4% coverage needs work) |

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
