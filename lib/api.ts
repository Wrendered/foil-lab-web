import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export interface WindEstimate {
  direction: number;
  confidence: string;
  port_average_angle: number;
  starboard_average_angle: number;
  total_segments: number;
  port_segments: number;
  starboard_segments: number;
}

export interface PerformanceMetrics {
  avg_speed: number | null;
  avg_upwind_angle: number | null;
  best_upwind_angle: number | null;
  vmg_upwind: number | null;
  vmg_downwind: number | null;
  port_tack_count: number;
  starboard_tack_count: number;
}

export interface TrackSummary {
  total_distance: number;
  duration_seconds: number;
  avg_speed_knots: number;
  max_speed_knots: number;
  filename: string;
}

export interface AnalysisResult {
  segments: any[];
  wind_estimate: WindEstimate;
  performance_metrics: PerformanceMetrics;
  track_summary: TrackSummary;
}

export interface ParameterRange {
  min: number;
  max: number;
  step: number;
}

export interface ConfigResponse {
  defaults: {
    wind_direction: number;
    angle_tolerance: number;
    min_duration: number;
    min_distance: number;
    min_speed: number;
    suspicious_angle_threshold: number;
  };
  ranges: {
    wind_direction: ParameterRange;
    angle_tolerance: ParameterRange;
    min_duration: ParameterRange;
    min_distance: ParameterRange;
    min_speed: ParameterRange;
    suspicious_angle_threshold: ParameterRange;
  };
}

export async function getConfig(): Promise<ConfigResponse> {
  const response = await api.get<ConfigResponse>('/api/config');
  return response.data;
}

export async function analyzeTrack(
  file: File,
  params: {
    wind_direction: number;
    angle_tolerance?: number;
    min_duration?: number;
    min_distance?: number;
    min_speed?: number;
    suspicious_angle_threshold?: number;
  }
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.post<AnalysisResult>(
    `/api/analyze-track?${queryParams.toString()}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}
