# CLAUDE.md - Foil Lab Web (Next.js Frontend)

This file provides guidance to Claude Code when working with the Next.js frontend for Foil Lab.

## Project Overview

**Foil Lab Web** is a React-based frontend for analyzing wingfoil/sailing GPS tracks. It provides wind direction input with historical lookup, interactive analysis parameters, and polar performance visualizations.

## Repository Structure

```
📁 foil-lab-web/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx             # Root layout with navigation
│   ├── page.tsx               # Home page
│   ├── analyze/page.tsx       # Main analysis interface
│   └── globals.css            # Global styles
├── components/                 # React components
│   ├── WindCompass.tsx        # Interactive click/drag compass
│   ├── TrackFileCard.tsx      # File card with wind + metadata
│   ├── TrackUploader.tsx      # Dropzone + file list
│   ├── TrackNavigator.tsx     # Multi-track navigation
│   ├── ComparisonView.tsx     # Track comparison UI
│   ├── SimpleAnalysisResults.tsx  # Results display
│   ├── PolarPlot.tsx          # Polar performance chart
│   └── ui/                    # shadcn/ui components
├── features/                   # Feature-specific code
│   └── track-analysis/
│       └── components/
│           └── ParameterControls.tsx
├── stores/                     # Zustand state stores
│   ├── uploadStore.ts         # File upload state
│   └── analysisStore.ts       # Analysis parameters + results
├── hooks/                      # Custom React hooks
│   └── useApi.ts              # React Query hooks for API
├── lib/                        # Utilities
│   ├── api-client.ts          # Axios client + types
│   ├── gpx-parser.ts          # Client-side GPX parsing
│   └── defaults.ts            # Default parameter values
└── public/                     # Static assets
```

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (stores) + React Query (API)
- **API Client**: Axios
- **File Upload**: react-dropzone
- **Forms**: react-hook-form
- **Icons**: lucide-react

## Key Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

## API Integration

### Environment
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000  # Local backend
# or
NEXT_PUBLIC_API_URL=https://your-backend.railway.app  # Production
```

### API Endpoints Used
- `GET /api/config` - Default parameters and ranges
- `GET /api/health` - Backend health check
- `GET /api/lookup-wind` - Historical wind from Open-Meteo
- `POST /api/analyze-track` - GPX file analysis

### API Client (`lib/api-client.ts`)
```typescript
// Key functions
getConfig(): Promise<ConfigResponse>
healthCheck(): Promise<{ status: string }>
lookupWind(lat, lon, date, hour): Promise<HistoricalWindResponse>
analyzeTrack(file, params): Promise<AnalysisResult>
```

### React Query Hooks (`hooks/useApi.ts`)
```typescript
useConfig()           // Fetch app config
useHealthCheck()      // Backend health
useLookupWind()       // Wind lookup mutation
useTrackAnalysis()    // Track analysis mutation
useConnectionStatus() // Derived connection state
```

## State Management

### Upload Store (`stores/uploadStore.ts`)
Manages uploaded files, their status, and GPS data:
```typescript
interface FileWithMetadata {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  result?: AnalysisResult;
  gpsData?: GPSPoint[];
  metadata?: GPXMetadata;
}
```

### Analysis Store (`stores/analysisStore.ts`)
Manages analysis parameters and current results:
```typescript
interface AnalysisParameters {
  windDirection: number;
  angleTolerance: number;
  minSpeed: number;
  minDistance: number;
  minDuration: number;
}
```

## Key Components

### WindCompass
Interactive SVG compass for setting wind direction:
- Click anywhere to set direction
- Drag to fine-tune
- Shows cardinal directions (N/E/S/W)
- Displays degrees and cardinal label (e.g., "285° (WNW)")

### TrackFileCard
Shows uploaded track with integrated wind:
- File name and status
- Track date and location from GPX
- Auto-lookups wind from Open-Meteo
- Embedded WindCompass
- Analyze button

### TrackUploader
Combines dropzone with file list:
- Drag & drop GPX files
- Shows TrackFileCard for each file
- Parses GPX metadata on upload

## Analysis Flow

1. User drops GPX file(s) in TrackUploader
2. GPX parsed client-side for metadata (date, location, points)
3. Wind auto-looked up from Open-Meteo API
4. User can adjust wind direction via compass
5. User clicks "Analyze Track"
6. Backend processes with wind + parameters
7. Results displayed (segments, polar plot, VMG, etc.)

## Styling

- Uses Tailwind CSS utility classes
- shadcn/ui for consistent components (Button, Card, Input, etc.)
- Blue theme for wind-related UI
- Green for success states, red for errors

## Development Tips

### Adding New API Endpoints
1. Add function in `lib/api-client.ts`
2. Add React Query hook in `hooks/useApi.ts`
3. Use hook in component

### Adding New Components
1. Create in `components/`
2. Use TypeScript interfaces
3. Handle loading/error states
4. Use Tailwind for styling

### Common Patterns
```typescript
// Using a mutation hook
const windLookup = useLookupWind();
windLookup.mutate({ latitude, longitude, date, hour }, {
  onSuccess: (result) => { /* handle success */ },
  onError: (error) => { /* handle error */ }
});

// Using the upload store
const uploadStore = useUploadStore();
uploadStore.addFile(file);
uploadStore.setFileGPSData(fileId, gpsPoints, metadata);
```

## Future Features (see ALGORITHM_IMPROVEMENTS.md)

- **Polar data output**: Speed vs angle tables
- **Track comparison**: Side-by-side stats and polars
- **Subset selection**: Analyze portion of large tracks
- **Export**: CSV/PNG of results

## Related Files

- Backend: `/Users/wrench/Software/foil-lab/`
- Algorithm plan: `/Users/wrench/Software/foil-lab/docs/ALGORITHM_IMPROVEMENTS.md`
- Backend API: `/Users/wrench/Software/foil-lab/backend/api/main.py`
