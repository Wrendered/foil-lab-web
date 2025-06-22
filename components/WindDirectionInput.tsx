'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wind } from 'lucide-react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useConfig } from '@/hooks/useApi';

interface WindDirectionInputProps {
  className?: string;
}

export function WindDirectionInput({ className = '' }: WindDirectionInputProps) {
  const analysisStore = useAnalysisStore();
  const { data: config } = useConfig();

  const { control, watch, reset } = useForm({
    defaultValues: {
      windDirection: analysisStore.parameters.windDirection,
    },
  });

  const watchedValue = watch('windDirection');

  // Update form when config loads
  useEffect(() => {
    if (config) {
      reset({
        windDirection: config.defaults.wind_direction || 90,
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

  const range = config?.ranges?.wind_direction || { min: 0, max: 360, step: 1 };

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Wind className="h-5 w-5" />
          Wind Direction (Required for Analysis)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
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
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              ⚠️ Set this BEFORE uploading files - it affects analysis results
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}