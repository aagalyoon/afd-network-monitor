import React, { useEffect, useRef } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import { divIcon, Marker as LeafletMarker } from 'leaflet';
import { NetworkNode } from '@/types/network';
import { useNetwork } from '@/context/network-context';
import StatusBadge from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Activity, BarChart3 } from 'lucide-react';

interface NodeMarkerProps {
  node: NetworkNode;
}

const NodeMarker: React.FC<NodeMarkerProps> = ({ node }) => {
  const { selectNode, selectedNodeId, setActiveTab, popupNodeId, showNodePopup } = useNetwork();
  const markerRef = useRef<LeafletMarker>(null);
  
  // Open or close the popup when popupNodeId changes
  useEffect(() => {
    if (markerRef.current) {
      if (popupNodeId === node.id) {
        markerRef.current.openPopup();
      } else if (popupNodeId !== null && popupNodeId !== node.id) {
        markerRef.current.closePopup();
      }
    }
  }, [popupNodeId, node.id]);
  
  // Create custom marker icon based on node status
  const createNodeIcon = (node: NetworkNode) => {
    const isSelected = selectedNodeId === node.id;
    const statusColor = 
      node.status === 'healthy' ? 'bg-healthy' : 
      node.status === 'degraded' ? 'bg-degraded' : 
      'bg-critical';
    
    // Create HTML for the icon
    const iconHtml = `
      <div class="${statusColor} ${isSelected ? 'ring-4 ring-primary/50' : ''} w-5 h-5 rounded-full flex items-center justify-center relative">
        ${node.status === 'critical' ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 bg-critical"></span>' : ''}
      </div>
    `;
    
    // Create the divIcon with the HTML
    return divIcon({
      html: iconHtml,
      className: 'custom-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };
  
  // View details handler
  const handleViewDetails = () => {
    selectNode(node.id);
    setActiveTab('details');
  };
  
  return (
    <Marker
      ref={markerRef}
      position={[node.location.lat, node.location.lng]}
      icon={createNodeIcon(node)}
      eventHandlers={{
        click: () => {
          selectNode(node.id);
          showNodePopup(node.id);
        },
        popupclose: () => {
          // Only clear the popup node if this marker's popup is being closed
          if (popupNodeId === node.id) {
            showNodePopup(null);
          }
        }
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
        <div className="text-xs font-medium">
          {node.name} ({node.type})
        </div>
        <div className="text-xs text-muted-foreground">
          {node.ip}
        </div>
      </Tooltip>
      
      <Popup>
        <div className="p-1 max-w-full" style={{ width: '228px' }}>
          <div className="font-medium text-base mb-1">{node.name}</div>
          <div className="text-xs text-muted-foreground mb-2">
            {node.city}, {node.region} • {node.type}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs font-medium">{node.ip}</div>
            <StatusBadge status={node.status} size="sm" />
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Latency:</span>{' '}
              <span className={node.metrics.latency > 100 ? 'text-critical' : node.metrics.latency > 50 ? 'text-degraded' : 'text-healthy'}>
                {node.metrics.latency} ms
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Packet Loss:</span>{' '}
              <span className={node.metrics.packetLoss > 1 ? 'text-critical' : node.metrics.packetLoss > 0.5 ? 'text-degraded' : 'text-healthy'}>
                {node.metrics.packetLoss}%
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Uptime:</span>{' '}
              {node.metrics.uptime}%
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Load:</span>{' '}
              {node.metrics.load}%
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 text-xs"
              onClick={handleViewDetails}
            >
              <Activity className="h-3.5 w-3.5 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default NodeMarker;
