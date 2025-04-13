import React from 'react';
import { TileLayer } from 'react-leaflet';
import L from 'leaflet';

// Custom TileLayer that ensures fallback to a placeholder for missing tiles
const CustomTileLayer: React.FC = () => {
  // Path to local tiles
  const tileUrl = '/tiles/{z}/{x}/{y}.png';
  
  // Custom error tile handler
  React.useEffect(() => {
    // Save the original tile error handler
    // Using any type to access internal Leaflet API
    const gridLayerProto = L.GridLayer.prototype as any;
    const originalCreateTile = gridLayerProto._createTile;
    
    // Override the createTile method
    gridLayerProto._createTile = function() {
      const tile = originalCreateTile.apply(this, arguments);
      
      // Handle tile load errors
      tile.onerror = function() {
        // Use placeholder for missing tiles
        tile.src = '/tiles/placeholder.png';
        tile.style.opacity = '0.7'; // Make it semi-transparent to indicate it's a placeholder
        return true; // Prevent default error handling
      };
      
      return tile;
    };
    
    // Cleanup
    return () => {
      gridLayerProto._createTile = originalCreateTile;
    };
  }, []);

  return (
    <TileLayer
      attribution='Map tiles locally stored'
      url={tileUrl}
      errorTileUrl='/tiles/placeholder.png'
    />
  );
};

export default CustomTileLayer; 