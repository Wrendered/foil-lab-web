'use client';

import { useEffect, useState } from 'react';
import { FileUpload } from '@/features/track-analysis/components/FileUpload';
import { ParameterControls } from '@/features/track-analysis/components/ParameterControls';
import { SimpleAnalysisResults } from '@/components/SimpleAnalysisResults';
import { WindDirectionInput } from '@/components/WindDirectionInput';
import { TrackNavigator } from '@/components/TrackNavigator';
import { ComparisonView } from '@/components/ComparisonView';
import { useUploadStore } from '@/stores/uploadStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientOnly } from '@/components/ClientOnly';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useConfig, useTrackAnalysis, useBatchAnalysis, useConnectionStatus } from '@/hooks/useApi';
import { useToast } from '@/components/ui/toast';
import { Loader2, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function AnalyzePage() {
  const uploadStore = useUploadStore();
  const analysisStore = useAnalysisStore();
  const { addToast } = useToast();
  const [isCompareMode, setIsCompareMode] = useState(false);

  // API hooks
  const { data: config, error: configError, isLoading: configLoading } = useConfig();
  const connectionStatus = useConnectionStatus();
  const trackAnalysis = useTrackAnalysis();
  const batchAnalysis = useBatchAnalysis();
  
  // Get the current file's result
  const currentFile = uploadStore.currentFileId 
    ? uploadStore.files.find(f => f.id === uploadStore.currentFileId)
    : uploadStore.files.find(f => f.status === 'completed' && f.result);
    
  const currentResult = currentFile?.result;

  // Set defaults when config loads (only once)
  useEffect(() => {
    if (config) {
      analysisStore.updateParameters({
        windDirection: config.defaults.wind_direction,
        angleTolerance: config.defaults.angle_tolerance,
        minSpeed: config.defaults.min_speed || 8.0,
        minDistance: config.defaults.min_distance,
        minDuration: config.defaults.min_duration,
      });
    }
  }, [config]); // Remove analysisStore from dependencies

  // Show toast notifications for API status
  useEffect(() => {
    if (configError) {
      addToast({
        title: 'Configuration Error',
        description: 'Failed to load app configuration. Using defaults.',
        variant: 'warning',
      });
    }
  }, [configError, addToast]);

  useEffect(() => {
    if (connectionStatus.status === 'disconnected') {
      addToast({
        title: 'Connection Lost',
        description: 'Unable to connect to the analysis server.',
        variant: 'error',
        duration: 0, // Persistent until connection restored
      });
    }
  }, [connectionStatus.status, addToast]);

  const handleFileSelect = (file: File) => {
    const fileWithMeta = uploadStore.files.find((f) => f.file === file);
    if (!fileWithMeta) return;

    // Start analysis
    analysisStore.setAnalyzing(true);
    
    trackAnalysis.mutate(
      {
        file,
        params: analysisStore.parameters,
        fileId: fileWithMeta.id,
      },
      {
        onSuccess: (result) => {
          // Update analysis store with results
          analysisStore.setSegments(result.segments || []);
          analysisStore.setWindAnalysis({
            estimatedDirection: result.wind_estimate.direction,
            confidence: result.wind_estimate.confidence,
            algorithmDirection: result.wind_estimate.direction,
            isOverridden: false,
          });
          analysisStore.setPerformanceMetrics({
            avgSpeed: result.performance_metrics.avg_speed,
            avgUpwindAngle: result.performance_metrics.avg_upwind_angle,
            bestUpwindAngle: result.performance_metrics.best_upwind_angle,
            vmgUpwind: result.performance_metrics.vmg_upwind,
            vmgDownwind: result.performance_metrics.vmg_downwind,
            portTackCount: result.performance_metrics.port_tack_count,
            starboardTackCount: result.performance_metrics.starboard_tack_count,
          });
          analysisStore.setAnalyzing(false);
          
          // Set this as the current file if no file is currently selected
          if (!uploadStore.currentFileId) {
            uploadStore.setCurrentFileId(fileWithMeta.id);
          }

          addToast({
            title: 'Analysis Complete',
            description: `Successfully analyzed ${file.name}`,
            variant: 'success',
          });
        },
        onError: (error) => {
          analysisStore.setError(error.message);
          analysisStore.setAnalyzing(false);

          addToast({
            title: 'Analysis Failed',
            description: error.message,
            variant: 'error',
          });
        },
      }
    );
  };

  const handleAnalyzeAll = () => {
    const pendingFiles = uploadStore.files
      .filter((f) => f.status === 'pending')
      .map((f) => ({ file: f.file, fileId: f.id }));
    
    if (pendingFiles.length === 0) return;

    batchAnalysis.mutate(
      {
        files: pendingFiles,
        params: analysisStore.parameters,
      },
      {
        onSuccess: (results) => {
          addToast({
            title: 'Batch Analysis Complete',
            description: `Successfully analyzed ${results.length} files`,
            variant: 'success',
          });
        },
        onError: (error) => {
          addToast({
            title: 'Batch Analysis Failed',
            description: error.message,
            variant: 'error',
          });
        },
      }
    );
  };

  // Handle track selection
  const handleTrackSelect = (fileId: string) => {
    uploadStore.setCurrentFileId(fileId);
    setIsCompareMode(false);
  };
  
  const handleCompareMode = () => {
    setIsCompareMode(true);
    uploadStore.setCurrentFileId(null);
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header with Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Track Analysis</h1>
              <p className="text-gray-600">
                Upload your GPX files to analyze sailing performance
              </p>
            </div>
            
            {/* Connection Status */}
            <Card className="p-3">
              <div className="flex items-center gap-2 text-sm">
                {connectionStatus.isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Connected</span>
                  </>
                ) : connectionStatus.isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-gray-600">Checking...</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Disconnected</span>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Configuration Status */}
          {configLoading && (
            <Card className="mb-4 p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Loading configuration...</span>
              </div>
            </Card>
          )}

          {configError && (
            <Card className="mb-4 p-4 border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800">Using default configuration</span>
              </div>
            </Card>
          )}

          {config && !configError && (
            <Card className="mb-4 p-4 border-green-200 bg-green-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800">Configuration loaded</span>
              </div>
            </Card>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Wind Direction, File Upload and Parameters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wind Direction - FIRST! */}
            <WindDirectionInput />
            
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload GPX Files</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  multiple={true}
                  className="mb-4"
                />

                <ClientOnly>
                  {/* Batch Actions */}
                  {uploadStore.files.filter((f) => f.status === 'pending').length > 0 && (
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={handleAnalyzeAll}
                        disabled={batchAnalysis.isPending || !connectionStatus.isConnected}
                      >
                        {batchAnalysis.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Analyze All Files ({uploadStore.files.filter((f) => f.status === 'pending').length})
                      </Button>
                    </div>
                  )}
                </ClientOnly>
              </CardContent>
            </Card>

            {/* Parameter Controls */}
            <ParameterControls
              onParametersChange={(params) => {
                // Parameters already updated via store in ParameterControls
                console.log('Parameters updated:', params);
              }}
              onReanalyze={() => {
                // Re-analyze current file with new parameters
                if (currentFile) {
                  handleFileSelect(currentFile.file);
                }
              }}
              disabled={analysisStore.isAnalyzing || !connectionStatus.isConnected}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <ClientOnly>
              {/* Analysis State */}
              {analysisStore.isAnalyzing && (
                <Card className="mb-8">
                  <CardContent className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Analyzing your track...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This may take a few moments for large files
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Error State */}
              {analysisStore.error && (
                <Card className="mb-8 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">Analysis Error</p>
                        <p className="text-red-600 text-sm mt-1">{analysisStore.error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Track Navigator */}
              {uploadStore.files.some(f => f.status === 'completed' && f.result) && (
                <TrackNavigator
                  onTrackSelect={handleTrackSelect}
                  onCompareMode={handleCompareMode}
                  currentFileId={uploadStore.currentFileId}
                  isCompareMode={isCompareMode}
                />
              )}
              
              {/* Results */}
              {!analysisStore.isAnalyzing && (
                <>
                  {/* Comparison Mode */}
                  {isCompareMode ? (
                    <ComparisonView />
                  ) : (
                    /* Individual Track Results */
                    currentResult && (
                      <Card className="mb-8">
                        <CardHeader>
                          <CardTitle>Analysis Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SimpleAnalysisResults 
                            result={currentResult} 
                            gpsData={currentFile?.gpsData}
                            fileId={currentFile?.id}
                          />
                        </CardContent>
                      </Card>
                    )
                  )}
                </>
              )}
            </ClientOnly>
          </div>
        </div>

        <ClientOnly>
          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-12">
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono space-y-1">
                  <p>Files in queue: {uploadStore.files.length}</p>
                  <p>
                    Files by status:{' '}
                    {['pending', 'uploading', 'processing', 'completed', 'error'].map(
                      (status) => {
                        const count = uploadStore.files.filter(
                          (f) => f.status === status
                        ).length;
                        return count > 0 ? `${status}=${count} ` : '';
                      }
                    )}
                  </p>
                  <p>Wind direction: {analysisStore.parameters.windDirection}°</p>
                  <p>VMG Highlight: {analysisStore.vmgHighlightEnabled ? 'ON' : 'OFF'}</p>
                  <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </ClientOnly>
      </div>
    </ErrorBoundary>
  );
}