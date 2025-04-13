import React from 'react';
import { useMap } from 'react-leaflet';
import { Plus, Minus } from 'lucide-react';

const CustomZoomButtons: React.FC = () => {
  const map = useMap();
  
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  // Using direct DOM positioning to ensure visibility
  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button 
          onClick={handleZoomIn}
          className="h-10 w-10 bg-white hover:bg-gray-100 text-black flex items-center justify-center border border-gray-300 border-b-0"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus size={20} />
        </button>
        <button 
          onClick={handleZoomOut}
          className="h-10 w-10 bg-white hover:bg-gray-100 text-black flex items-center justify-center border border-gray-300"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus size={20} />
        </button>
      </div>
    </div>
  );
};

export default CustomZoomButtons; 