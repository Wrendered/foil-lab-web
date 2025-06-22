# CLAUDE.md - Foil Lab Web (Next.js Frontend)

This file provides guidance to Claude Code (claude.ai/code) when working with the Next.js frontend for Foil Lab.

## Project Overview

**Foil Lab Web** is a modern React-based frontend for the Foil Lab track analysis platform. It provides a clean, responsive UI for analyzing wingfoil/sailing GPS tracks with real-time parameter adjustment and beautiful visualizations.

## Repository Structure

```
📁 foil-lab-web/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx             # Root layout with navigation
│   ├── page.tsx               # Home page
│   ├── analyze/               # Analysis page
│   │   └── page.tsx          # Track analysis interface
│   └── globals.css           # Global styles
├── components/                # Reusable React components
│   ├── FileUpload.tsx        # GPX file upload with drag & drop
│   └── AnalysisResults.tsx   # Results display component
├── lib/                       # Utilities and API client
│   └── api.ts                # API client with types
├── public/                    # Static assets
├── .env.local                # Environment variables
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── next.config.mjs           # Next.js configuration
```

## Technology Stack

- **Framework**: Next.js 14.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **API Client**: Axios
- **File Upload**: react-dropzone
- **Icons**: lucide-react
- **Deployment**: Vercel (planned)

## Key Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev         # http://localhost:3000

# Production build
npm run build
npm run start

# Type checking
npm run type-check  # (add to package.json if needed)

# Linting
npm run lint
```

## API Integration

### Configuration
The app fetches default parameters and ranges from the backend on load:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fetches from GET /api/config
const config = await getConfig();
```

### Environment Setup
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://strava-tracks-analyzer-production.up.railway.app
```

### API Endpoints Used
- `GET /api/config` - Default parameters and ranges
- `POST /api/analyze-track` - GPX file analysis
- `GET /api/health` - Backend health check

## Component Architecture

### Pages
- **Home** (`app/page.tsx`): Landing page with features overview
- **Analyze** (`app/analyze/page.tsx`): Main analysis interface

### Components
- **FileUpload**: Drag & drop GPX file upload
  - Uses react-dropzone
  - Shows upload state and selected file
  - Validates file type (.gpx only)

- **AnalysisResults**: Displays analysis results
  - Performance metrics cards
  - Wind estimation details
  - Session summary
  - Responsive grid layout

### State Management
```typescript
// app/analyze/page.tsx
const [file, setFile] = useState<File | null>(null);
const [loading, setLoading] = useState(false);
const [result, setResult] = useState<AnalysisResult | null>(null);
const [config, setConfig] = useState<ConfigResponse | null>(null);

// Dynamic parameter states
const [windDirection, setWindDirection] = useState(90);
const [angleTolerance, setAngleTolerance] = useState(25);
```

## Styling Guidelines

### Tailwind Classes
- Use semantic color names: `text-gray-700`, `bg-blue-50`
- Responsive utilities: `lg:col-span-2`, `md:grid-cols-2`
- Interactive states: `hover:bg-blue-700`, `disabled:opacity-50`

### Custom Components
- Wind direction has enhanced UI with blue theme
- Metric cards use color coding (blue, green, purple, orange)
- Loading states with animated spinners

### CSS Variables
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
```

## Development Workflow

### Adding New Features
1. Create component in `components/`
2. Add TypeScript interfaces in component or `lib/api.ts`
3. Use consistent styling patterns
4. Handle loading and error states
5. Test with backend API

### Parameter Management
- Parameters fetched from backend on load
- Fallback to hardcoded defaults if API fails
- All sliders use dynamic min/max/step from config

### File Structure Conventions
```
components/
├── FeatureName.tsx        # Component implementation
├── FeatureName.test.tsx   # Component tests (if added)
└── index.ts              # Barrel export (if multiple components)
```

## Type Definitions

### Core Types
```typescript
// Wind estimation result
interface WindEstimate {
  direction: number;
  confidence: string;
  port_average_angle: number;
  starboard_average_angle: number;
  total_segments: number;
  port_segments: number;
  starboard_segments: number;
}

// Performance metrics
interface PerformanceMetrics {
  avg_speed: number | null;
  avg_upwind_angle: number | null;
  best_upwind_angle: number | null;
  vmg_upwind: number | null;
  vmg_downwind: number | null;
  port_tack_count: number;
  starboard_tack_count: number;
}

// Configuration response
interface ConfigResponse {
  defaults: { [key: string]: number };
  ranges: { [key: string]: ParameterRange };
}
```

## Error Handling

### API Errors
```typescript
try {
  const result = await analyzeTrack(file, params);
} catch (err: any) {
  setError(
    err.response?.data?.detail || 
    'Analysis failed. Please check your file and try again.'
  );
}
```

### Loading States
- File upload shows loading spinner
- Analysis button disabled during processing
- Configuration loads on mount with loading indicator

## Performance Considerations

- Large GPX files uploaded as FormData
- Results rendering optimized with React
- Minimal re-renders with proper state management
- Static assets optimized by Next.js

## Deployment

### Vercel Deployment
1. Push to GitHub repository
2. Connect to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
4. Deploy from branch

### Build Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

## Future Enhancements

### Planned Features
- Polar plots for wind angles
- Interactive track map visualization
- Session comparison tool
- Export functionality (CSV, PNG)
- User preferences persistence

### Technical Improvements
- Add React Query for API state management
- Implement proper error boundaries
- Add comprehensive test suite
- Progressive Web App capabilities
- Offline support with service workers

## Common Issues

### CORS Errors
- Ensure backend has proper CORS configuration
- Check API URL in environment variables

### Build Errors
- Clear `.next` directory and rebuild
- Check for TypeScript errors with `tsc --noEmit`
- Ensure all dependencies are installed

### State Management
- Use proper dependency arrays in useEffect
- Handle cleanup for async operations
- Manage loading states consistently

## Integration with Backend

### Data Flow
1. User uploads GPX file
2. Frontend sends to `/api/analyze-track`
3. Backend processes with core algorithms
4. Results returned and displayed
5. User can adjust parameters and re-analyze

### Configuration Sync
- Backend is single source of truth
- Frontend fetches on load
- Parameters automatically stay in sync
- No hardcoded values in frontend

## Development Tips

### Best Practices
- Keep components focused and reusable
- Use TypeScript strictly for type safety
- Handle all loading and error states
- Make UI responsive and accessible
- Follow React hooks rules

### Testing Approach
- Test with various GPX file sizes
- Verify parameter ranges work correctly
- Check error handling for network issues
- Test on mobile devices
- Validate accessibility

## Related Documentation

- Main backend CLAUDE.md: `../strava-tracks-analyzer/CLAUDE.md`
- API documentation: `../strava-tracks-analyzer/api/main.py`
- Deployment guide: See backend CLAUDE.md