import React, { useState, useRef, useCallback } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import { NetworkNode, NetworkConnection } from '@/types/network';
import NodeMarker from './node-marker';
import ConnectionLine from './connection-line';
import { useMap as useMapContext } from '@/context/map-context';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { LatLngTuple, Map as LeafletMap } from 'leaflet';
import CustomTileLayer from '../map/custom-tile-layer';
import CustomZoomButtons from '../map/custom-zoom-buttons';
import { Compass } from 'lucide-react';

// Initial view centered on Columbia, MD
const INITIAL_VIEW = {
  center: [39.2037, -76.8610] as LatLngTuple, // Columbia, MD coordinates
  zoom: 5 // Zoom level to focus around Columbia region
};

// Helper component to handle map view changes
const MapUpdater: React.FC = () => {
  const map = useMap();
  const { center, zoom, setIsMapReady } = useMapContext();
  
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  
  useEffect(() => {
    setIsMapReady(true);
    
    return () => {
      setIsMapReady(false);
    };
  }, [setIsMapReady]);
  
  return null;
};

interface NetworkMapProps {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
}

const NetworkMap: React.FC<NetworkMapProps> = ({ nodes, connections }) => {
  const { center, zoom, setView } = useMapContext();
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  
  // Limit the max zoom level to what we've pre-downloaded (zoom level 8)
  const mapOptions = {
    minZoom: 5, // Temporarily disabled zoom levels 3 and 4
    maxZoom: 8,
    attributionControl: false, // Disable attribution control to remove Leaflet link
    zoomControl: false, // Disable default zoom control, we'll use our custom one
    maxBounds: [
      [24.5, -125.0] as LatLngTuple, // Southwest corner of US
      [49.5, -66.0] as LatLngTuple  // Northeast corner of US
    ],
    maxBoundsViscosity: 1.0 // Keep the user within the US bounds
  };

  const onMapReady = useCallback(() => {
    setMapLoaded(true);
  }, []);
  
  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView(INITIAL_VIEW.center, INITIAL_VIEW.zoom, { animate: true });
    }
    // Also update the context
    setView(INITIAL_VIEW.center, INITIAL_VIEW.zoom);
  };
  
  // Get map reference when the component is mounted
  const handleMapRef = (mapInstance: LeafletMap | null) => {
    if (mapInstance) {
      mapRef.current = mapInstance;
    }
  };
  
  return (
    <div className="map-container relative">
      <div className="absolute top-3 right-3 z-[1000] bg-green-100 dark:bg-green-900/80 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full border border-green-200 dark:border-green-800/50">
        Local Tiles
      </div>
      
      {/* Reset view button */}
      <div className="absolute top-3 left-3 z-[1000]">
        <button 
          onClick={handleResetView}
          className="h-10 px-3 rounded-md bg-white hover:bg-gray-100 text-black flex items-center justify-center border border-gray-300 shadow-md text-sm font-medium"
          aria-label="Reset view"
        >
          <Compass size={16} className="mr-2" />
          Reset View
        </button>
      </div>
      
      <MapContainer
        center={center || INITIAL_VIEW.center}
        zoom={zoom || INITIAL_VIEW.zoom}
        className="h-full w-full z-0"
        ref={handleMapRef}
        whenReady={onMapReady}
        {...mapOptions}
      >
        <CustomTileLayer />
        
        {/* Show connections under the nodes */}
        {connections.map((connection) => (
          <ConnectionLine 
            key={connection.id} 
            connection={connection}
            nodes={nodes}
          />
        ))}
        
        {/* Show node markers on top */}
        {nodes.map((node) => (
          <NodeMarker key={node.id} node={node} />
        ))}
        
        {/* Custom zoom buttons inside the map */}
        <CustomZoomButtons />
        
        {/* Update map view when center/zoom change */}
        <MapUpdater />
      </MapContainer>
    </div>
  );
};

export default NetworkMap;
