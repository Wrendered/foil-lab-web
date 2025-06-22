'use client';

import { AnalysisResult } from '@/lib/api';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const metrics = result.performance_metrics;
  const windEstimate = result.wind_estimate;
  const summary = result.track_summary;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Segments"
          value={result.segments.length}
          unit=""
          color="blue"
        />
        <MetricCard
          label="Wind Direction"
          value={windEstimate.direction.toFixed(0)}
          unit="°"
          subtext={`Confidence: ${windEstimate.confidence}`}
          color="green"
        />
        <MetricCard
          label="VMG Upwind"
          value={metrics.vmg_upwind?.toFixed(1) || 'N/A'}
          unit="kn"
          color="purple"
        />
        <MetricCard
          label="Avg Speed"
          value={summary.avg_speed_knots.toFixed(1)}
          unit="kn"
          subtext={`Max: ${summary.max_speed_knots.toFixed(1)} kn`}
          color="orange"
        />
      </div>

      {/* Performance Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Upwind Performance</h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Best Upwind Angle:</dt>
                <dd className="font-medium">
                  {metrics.best_upwind_angle?.toFixed(0) || 'N/A'}°
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Avg Upwind Angle:</dt>
                <dd className="font-medium">
                  {metrics.avg_upwind_angle?.toFixed(0) || 'N/A'}°
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Port Tacks:</dt>
                <dd className="font-medium">{metrics.port_tack_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Starboard Tacks:</dt>
                <dd className="font-medium">{metrics.starboard_tack_count}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Session Summary</h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Total Distance:</dt>
                <dd className="font-medium">
                  {summary.total_distance.toFixed(1)} km
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Duration:</dt>
                <dd className="font-medium">
                  {Math.floor(summary.duration_seconds / 60)} min
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Avg Speed:</dt>
                <dd className="font-medium">
                  {metrics.avg_speed?.toFixed(1) || summary.avg_speed_knots.toFixed(1)} kn
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Wind Estimation Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Wind Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {windEstimate.port_segments}
            </p>
            <p className="text-sm text-gray-600">Port Segments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {windEstimate.starboard_segments}
            </p>
            <p className="text-sm text-gray-600">Starboard Segments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {windEstimate.port_average_angle.toFixed(0)}°
            </p>
            <p className="text-sm text-gray-600">Port Avg Angle</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {windEstimate.starboard_average_angle.toFixed(0)}°
            </p>
            <p className="text-sm text-gray-600">Starboard Avg Angle</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  subtext?: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({ label, value, unit, subtext, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className={`rounded-lg p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">
        {value}
        <span className="text-xl ml-1">{unit}</span>
      </p>
      {subtext && <p className="text-xs mt-1 opacity-70">{subtext}</p>}
    </div>
  );
}
