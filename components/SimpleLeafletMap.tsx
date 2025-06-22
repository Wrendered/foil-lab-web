'use client';

import { useEffect, useRef } from 'react';

interface SimpleLeafletMapProps {
  gpxData?: Array<{ latitude: number; longitude: number; time?: string }>;
  segments?: any[];
  windDirection?: number;
  highlightVMG?: boolean;
  vmgSegmentIds?: number[];
}

export function SimpleLeafletMap({ gpxData = [], segments = [], windDirection = 0, highlightVMG = false, vmgSegmentIds = [] }: SimpleLeafletMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<any[]>([]);

  const updateMapContent = (L: any) => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers except tile layer
    layersRef.current.forEach(layer => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    layersRef.current = [];

    // Add GPS track and segments
    if (gpxData.length > 0) {
      const trackCoords = gpxData.map(p => [p.latitude, p.longitude]);
      
      // Draw full track in gray first
      const trackLayer = L.polyline(trackCoords, {
        color: '#9CA3AF',
        weight: 3,
        opacity: 0.6,
      });
      trackLayer.addTo(map);
      layersRef.current.push(trackLayer);

      // Add segments if available
      if (segments && segments.length > 0) {
        const vmgSegmentIdSet = new Set(vmgSegmentIds);
        segments.forEach(segment => {
          const segmentCoords = trackCoords.slice(segment.start_idx, segment.end_idx + 1);
          if (segmentCoords.length > 1) {
            const isVMGSegment = highlightVMG && vmgSegmentIdSet.has(segment.id);
            let color = '#3B82F6';
            let weight = 5;
            let opacity = 0.8;
            
            if (isVMGSegment) {
              color = '#FFD700';
              weight = 7;
              opacity = 1.0;
            } else if (segment.direction === 'Upwind') {
              color = segment.tack === 'Port' ? '#EF4444' : '#3B82F6';
            } else {
              color = segment.tack === 'Port' ? '#F97316' : '#8B5CF6';
            }
            
            const segmentLayer = L.polyline(segmentCoords, { color, weight, opacity });
            segmentLayer.addTo(map);
            layersRef.current.push(segmentLayer);
          }
        });
      }

      // Add markers
      const startMarker = L.marker(trackCoords[0]).bindPopup('Start');
      const endMarker = L.marker(trackCoords[trackCoords.length - 1]).bindPopup('Finish');
      startMarker.addTo(map);
      endMarker.addTo(map);
      layersRef.current.push(startMarker, endMarker);

      // Only fit bounds when creating new map or switching files, not for VMG toggle
      if (!map._boundsSet) {
        const lats = gpxData.map(p => p.latitude);
        const lngs = gpxData.map(p => p.longitude);
        const bounds = [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)]
        ];
        map.fitBounds(bounds, { padding: [20, 20] });
        map._boundsSet = true; // Mark that bounds have been set
      }
    }
  };

  // Effect for creating the map (only runs when GPS data or segments change)
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) {
      return;
    }

    // Dynamic import of Leaflet
    import('leaflet').then((L) => {
      // Only create map if it doesn't exist yet
      if (mapRef.current) {
        // Map exists, just update its content
        updateMapContent(L);
        return;
      }
      
      // Clear container for new map
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        (containerRef.current as any)._leaflet_id = null;
      }

      // Determine center coordinates with validation
      let center: [number, number] = [50.832, -4.556]; // Default
      if (gpxData.length > 0 && gpxData[0]) {
        const firstPoint = gpxData[0];
        if (firstPoint.latitude && firstPoint.longitude && 
            !isNaN(firstPoint.latitude) && !isNaN(firstPoint.longitude)) {
          center = [firstPoint.latitude, firstPoint.longitude];
        }
      }

      // Create map
      const map = L.map(containerRef.current!, {
        center: center,
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true
      });

      // Add tile layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });
      
      tileLayer.on('tileerror', (e: any) => {
        console.error('Tile loading error:', e);
      });
      
      tileLayer.addTo(map);
      
      // Force map to refresh - with safety check
      setTimeout(() => {
        if (map && map.getContainer && map.getContainer()) {
          map.invalidateSize();
        }
      }, 100);

      mapRef.current = map;
      
      // Add initial content
      updateMapContent(L);
    }).catch(err => {
      console.error('Failed to load map:', err);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        (containerRef.current as any)._leaflet_id = null;
      }
    };
  }, [gpxData?.length, segments?.length]);

  // Separate effect for VMG highlight updates that don't recreate the map
  useEffect(() => {
    if (mapRef.current && typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        updateMapContent(L);
      });
    }
  }, [highlightVMG, vmgSegmentIds?.length]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '400px',
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
}