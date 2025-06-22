import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface AnalysisParameters {
  windDirection: number;
  angleTolerance: number;
  minSpeed: number;
  minDistance: number;
  minDuration: number;
}

export interface TrackSegment {
  id: number;
  start_idx: number;
  end_idx: number;
  distance: number;
  duration: number;
  avg_speed_knots: number;
  bearing: number;
  angle_to_wind: number;
  tack: 'Port' | 'Starboard';
  direction: 'Upwind' | 'Downwind';
  sailing_type: string;
}

export interface WindAnalysis {
  estimatedDirection: number;
  confidence: 'High' | 'Medium' | 'Low';
  algorithmDirection: number;
  isOverridden: boolean;
}

export interface PerformanceMetrics {
  avgSpeed: number | null;
  avgUpwindAngle: number | null;
  bestUpwindAngle: number | null;
  vmgUpwind: number | null;
  vmgDownwind: number | null;
  portTackCount: number;
  starboardTackCount: number;
}

interface AnalysisState {
  // Current analysis data
  trackId: string | null;
  segments: TrackSegment[];
  windAnalysis: WindAnalysis | null;
  performanceMetrics: PerformanceMetrics | null;
  parameters: AnalysisParameters;
  
  // UI state
  isAnalyzing: boolean;
  error: string | null;
  selectedSegmentIds: number[];
  vmgHighlightEnabled: boolean;
  windLinesEnabled: boolean;
  
  // Actions
  setTrackId: (id: string) => void;
  setSegments: (segments: TrackSegment[]) => void;
  setWindAnalysis: (analysis: WindAnalysis) => void;
  setPerformanceMetrics: (metrics: PerformanceMetrics) => void;
  updateParameters: (params: Partial<AnalysisParameters>) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  toggleSegmentSelection: (segmentId: number) => void;
  selectAllSegments: () => void;
  deselectAllSegments: () => void;
  setVmgHighlight: (enabled: boolean) => void;
  setWindLines: (enabled: boolean) => void;
  overrideWindDirection: (direction: number) => void;
  resetWindOverride: () => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  immer((set) => ({
    // Initial state
    trackId: null,
    segments: [],
    windAnalysis: null,
    performanceMetrics: null,
    parameters: {
      windDirection: 90,
      angleTolerance: 25,
      minSpeed: 8.0,
      minDistance: 75,
      minDuration: 15,
    },
    isAnalyzing: false,
    error: null,
    selectedSegmentIds: [],
    vmgHighlightEnabled: false,
    windLinesEnabled: true,

    // Actions
    setTrackId: (id) =>
      set((state) => {
        state.trackId = id;
      }),

    setSegments: (segments) =>
      set((state) => {
        state.segments = segments;
        // Auto-select all segments
        state.selectedSegmentIds = segments.map((s) => s.id);
      }),

    setWindAnalysis: (analysis) =>
      set((state) => {
        state.windAnalysis = analysis;
      }),

    setPerformanceMetrics: (metrics) =>
      set((state) => {
        state.performanceMetrics = metrics;
      }),

    updateParameters: (params) =>
      set((state) => {
        state.parameters = { ...state.parameters, ...params };
      }),

    setAnalyzing: (isAnalyzing) =>
      set((state) => {
        state.isAnalyzing = isAnalyzing;
        if (isAnalyzing) {
          state.error = null;
        }
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
        state.isAnalyzing = false;
      }),

    toggleSegmentSelection: (segmentId) =>
      set((state) => {
        const index = state.selectedSegmentIds.indexOf(segmentId);
        if (index > -1) {
          state.selectedSegmentIds.splice(index, 1);
        } else {
          state.selectedSegmentIds.push(segmentId);
        }
      }),

    selectAllSegments: () =>
      set((state) => {
        state.selectedSegmentIds = state.segments.map((s) => s.id);
      }),

    deselectAllSegments: () =>
      set((state) => {
        state.selectedSegmentIds = [];
      }),

    setVmgHighlight: (enabled) =>
      set((state) => {
        state.vmgHighlightEnabled = enabled;
      }),

    setWindLines: (enabled) =>
      set((state) => {
        state.windLinesEnabled = enabled;
      }),

    overrideWindDirection: (direction) =>
      set((state) => {
        if (state.windAnalysis) {
          state.windAnalysis.estimatedDirection = direction;
          state.windAnalysis.isOverridden = true;
        }
        state.parameters.windDirection = direction;
      }),

    resetWindOverride: () =>
      set((state) => {
        if (state.windAnalysis) {
          state.windAnalysis.estimatedDirection = state.windAnalysis.algorithmDirection;
          state.windAnalysis.isOverridden = false;
        }
        state.parameters.windDirection = state.windAnalysis?.algorithmDirection || 90;
      }),

    reset: () =>
      set((state) => {
        state.trackId = null;
        state.segments = [];
        state.windAnalysis = null;
        state.performanceMetrics = null;
        state.isAnalyzing = false;
        state.error = null;
        state.selectedSegmentIds = [];
        state.vmgHighlightEnabled = false;
      }),
  }))
);