import React, { createContext, useContext, useState, useEffect } from 'react';
import { LatLngTuple } from 'leaflet';
import { useNetwork } from './network-context';

// Columbia, MD coordinates (replacing US center)
const COLUMBIA_CENTER: LatLngTuple = [39.2037, -76.8610];
const DEFAULT_ZOOM = 5;

interface MapContextType {
  center: LatLngTuple;
  zoom: number;
  setView: (center: LatLngTuple, zoom: number) => void;
  flyToNode: (nodeId: string) => void;
  isMapReady: boolean;
  setIsMapReady: (isReady: boolean) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Columbia, MD view
  const [center, setCenter] = useState<LatLngTuple>(COLUMBIA_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [isMapReady, setIsMapReady] = useState(false);
  
  const { nodes, selectedNodeId } = useNetwork();

  // Set view to specific coordinates and zoom level
  const setView = (newCenter: LatLngTuple, newZoom: number) => {
    setCenter(newCenter);
    setZoom(newZoom);
  };

  // Fly to a specific node's location
  const flyToNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setView([node.location.lat, node.location.lng], 8);
    }
  };

  // Respond to selectedNodeId changes
  useEffect(() => {
    if (selectedNodeId && isMapReady) {
      flyToNode(selectedNodeId);
    }
  }, [selectedNodeId, isMapReady]);

  return (
    <MapContext.Provider
      value={{
        center,
        zoom,
        setView,
        flyToNode,
        isMapReady,
        setIsMapReady,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
