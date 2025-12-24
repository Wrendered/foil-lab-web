'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wind, MapPin, Calendar, Loader2, Cloud, CheckCircle } from 'lucide-react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useUploadStore } from '@/stores/uploadStore';
import { useConfig, useLookupWind } from '@/hooks/useApi';
import { DEFAULT_PARAMETERS } from '@/lib/defaults';
import { GPXMetadata, GPSPoint } from '@/lib/gpx-parser';

interface WindDirectionInputProps {
  className?: string;
}

function formatDate(isoString: string): { date: string; hour: number; displayDate: string } {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = d.getHours();

  return {
    date: `${year}-${month}-${day}`,
    hour,
    displayDate: d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
}

function formatLocation(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}

export function WindDirectionInput({ className = '' }: WindDirectionInputProps) {
  const analysisStore = useAnalysisStore();
  const uploadStore = useUploadStore();
  const { data: config } = useConfig();
  const windLookup = useLookupWind();
  const [lookupResult, setLookupResult] = useState<{ direction: number; speed: number } | null>(null);

  // Get current file metadata
  const currentFile = uploadStore.currentFileId
    ? uploadStore.files.find(f => f.id === uploadStore.currentFileId)
    : uploadStore.files.find(f => f.status === 'completed' || f.status === 'pending');

  const metadata = currentFile?.metadata;
  const gpsData = currentFile?.gpsData;

  // Extract location from first GPS point or bounds center
  const location = gpsData?.[0]
    ? { lat: gpsData[0].latitude, lon: gpsData[0].longitude }
    : metadata?.bounds
      ? {
          lat: (metadata.bounds.minLat + metadata.bounds.maxLat) / 2,
          lon: (metadata.bounds.minLon + metadata.bounds.maxLon) / 2
        }
      : null;

  // Extract and format date
  const trackTime = metadata?.time || gpsData?.[0]?.time;
  const dateInfo = trackTime ? formatDate(trackTime) : null;

  const { control, watch, reset, setValue } = useForm({
    defaultValues: {
      windDirection: analysisStore.parameters.windDirection,
    },
  });

  const watchedValue = watch('windDirection');

  // Update form when config loads
  useEffect(() => {
    if (config) {
      reset({
        windDirection: config.defaults.wind_direction || DEFAULT_PARAMETERS.windDirection,
      });
    }
  }, [config, reset]);

  // Real-time parameter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      analysisStore.updateParameters({
        ...analysisStore.parameters,
        windDirection: watchedValue,
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [watchedValue, analysisStore]);

  // Clear lookup result when file changes
  useEffect(() => {
    setLookupResult(null);
  }, [currentFile?.id]);

  const handleLookupWind = async () => {
    if (!location || !dateInfo) return;

    try {
      const result = await windLookup.mutateAsync({
        latitude: location.lat,
        longitude: location.lon,
        date: dateInfo.date,
        hour: dateInfo.hour,
      });

      // Update wind direction with the looked-up value
      setValue('windDirection', Math.round(result.wind_direction));
      setLookupResult({
        direction: result.wind_direction,
        speed: result.wind_speed_knots,
      });
    } catch (error) {
      console.error('Wind lookup failed:', error);
    }
  };

  const range = config?.ranges?.wind_direction || { min: 0, max: 360, step: 1 };
  const canLookupWind = location && dateInfo;

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Wind className="h-5 w-5" />
          Wind Direction
        </CardTitle>
        <p className="text-sm text-blue-700 mt-1">
          Set the wind direction for accurate analysis
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Track Context - show when we have metadata */}
          {(dateInfo || location) && (
            <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
              <p className="font-medium text-blue-900">Track Info</p>
              {dateInfo && (
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>{dateInfo.displayDate}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2 text-blue-800">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{formatLocation(location.lat, location.lon)}</span>
                </div>
              )}
            </div>
          )}

          {/* Wind Lookup Button */}
          {canLookupWind && (
            <Button
              onClick={handleLookupWind}
              disabled={windLookup.isPending}
              variant="outline"
              className="w-full bg-white hover:bg-blue-100 border-blue-300"
            >
              {windLookup.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Looking up wind...
                </>
              ) : (
                <>
                  <Cloud className="h-4 w-4 mr-2" />
                  Look Up Historical Wind
                </>
              )}
            </Button>
          )}

          {/* Lookup Result */}
          {lookupResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">
                  Wind was {Math.round(lookupResult.direction)}° at {lookupResult.speed.toFixed(1)} kts
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                From Open-Meteo historical weather data
              </p>
            </div>
          )}

          {/* Lookup Error */}
          {windLookup.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                Could not look up wind data. Please enter manually.
              </p>
            </div>
          )}

          {/* Direction Input */}
          <div className="flex items-center gap-3">
            <Label htmlFor="windDirection" className="text-blue-900 font-medium min-w-0">
              Direction:
            </Label>
            <Controller
              control={control}
              name="windDirection"
              render={({ field }) => (
                <Input
                  id="windDirection"
                  type="number"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={field.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value))}
                  className="flex-1 text-lg font-semibold text-center"
                />
              )}
            />
            <span className="text-lg font-semibold text-blue-900 min-w-0">°</span>
          </div>
          <p className="text-sm text-blue-700 text-center">
            Direction the wind is coming FROM<br/>
            (0° = North, 90° = East, 180° = South, 270° = West)
          </p>

          {/* Help text - simpler now that we have lookup */}
          {!canLookupWind && (
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-xs text-blue-800 text-center leading-relaxed">
                Upload a GPX file to enable historical wind lookup
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
