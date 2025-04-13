import React from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { NetworkConnection, NetworkNode } from '@/types/network';
import { useNetwork } from '@/context/network-context';
import './connection-tooltip.css';

interface ConnectionLineProps {
  connection: NetworkConnection;
  nodes: NetworkNode[];
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ connection, nodes }) => {
  const { getNodeById } = useNetwork();
  
  // Find the source and target nodes
  const sourceNode = getNodeById(connection.source);
  const targetNode = getNodeById(connection.target);
  
  // If either node is missing, don't render the connection
  if (!sourceNode || !targetNode) {
    return null;
  }
  
  // Create path between the two nodes
  // Explicitly type as LatLngTuple[] to fix the type error
  const positions: LatLngTuple[] = [
    [sourceNode.location.lat, sourceNode.location.lng],
    [targetNode.location.lat, targetNode.location.lng],
  ];
  
  // Determine color based on connection status
  const getConnectionColor = () => {
    switch (connection.status) {
      case 'healthy':
        return { color: '#10b981', weight: 2, opacity: 0.8 };
      case 'degraded':
        return { color: '#f59e0b', weight: 2, opacity: 0.8 };
      case 'critical':
        return { color: '#ef4444', weight: 2, opacity: 0.8 };
      default:
        return { color: '#94a3b8', weight: 2, opacity: 0.7 };
    }
  };
  
  // Create tooltip content
  const tooltipContent = (
    <div className="text-xs p-1">
      <div className="font-medium">
        {sourceNode.name} → {targetNode.name}
      </div>
      <div className="grid grid-cols-2 gap-x-3 mt-1">
        <div>
          <span className="text-muted-foreground">Status:</span>{' '}
          <span className={`text-${connection.status}`}>
            {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Latency:</span>{' '}
          {connection.metrics.latency} ms
        </div>
        <div>
          <span className="text-muted-foreground">Bandwidth:</span>{' '}
          {connection.metrics.bandwidth} Mbps
        </div>
        <div>
          <span className="text-muted-foreground">Packet Loss:</span>{' '}
          {connection.metrics.packetLoss}%
        </div>
      </div>
    </div>
  );
  
  return (
    <Polyline 
      positions={positions} 
      pathOptions={getConnectionColor()}
    >
      <Tooltip direction="top" sticky className="wide-tooltip">
        {tooltipContent}
      </Tooltip>
    </Polyline>
  );
};

export default ConnectionLine;
