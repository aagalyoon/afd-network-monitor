
import React from 'react';
import { useNetwork } from '@/context/network-context';
import StatusBadge from '@/components/ui/status-badge';
import MetricDisplay from '@/components/ui/metric-display';
import { Button } from '@/components/ui/button';
import { Network, Zap, Terminal, Router, Server, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const NodeDetails: React.FC = () => {
  const { selectedNodeId, getNodeById, pingNode, tracerouteNode, selectNode } = useNetwork();
  
  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;
  
  if (!selectedNode) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Select a node to view details
      </div>
    );
  }
  
  // Determine icon based on node type
  const getNodeIcon = () => {
    switch (selectedNode.type) {
      case 'server':
        return <Server className="h-5 w-5" />;
      case 'router':
        return <Router className="h-5 w-5" />;
      case 'switch':
        return <Network className="h-5 w-5" />;
      case 'gateway':
        return <Network className="h-5 w-5" />;
      default:
        return <Server className="h-5 w-5" />;
    }
  };
  
  // Handle diagnostic actions
  const handlePing = () => {
    pingNode(selectedNode.id);
  };
  
  const handleTraceroute = () => {
    tracerouteNode(selectedNode.id);
  };
  
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-2">
            <div className="bg-muted rounded-md p-2 mt-0.5">
              {getNodeIcon()}
            </div>
            <div>
              <h3 className="font-medium text-lg">{selectedNode.name}</h3>
              <div className="text-sm text-muted-foreground">
                {selectedNode.city}, {selectedNode.region}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => selectNode(null)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{selectedNode.ip}</div>
            <StatusBadge status={selectedNode.status} />
          </div>
          
          <div className="grid grid-cols-2 gap-3 bg-muted/50 rounded-lg p-3">
            <MetricDisplay 
              label="Latency" 
              value={selectedNode.metrics.latency} 
              unit="ms" 
              showThresholds 
              thresholdLow={50}
              thresholdHigh={100}
            />
            <MetricDisplay 
              label="Packet Loss" 
              value={selectedNode.metrics.packetLoss} 
              unit="%" 
              showThresholds 
              thresholdLow={0.5}
              thresholdHigh={1}
            />
            <MetricDisplay 
              label="Uptime" 
              value={selectedNode.metrics.uptime} 
              unit="%" 
              showThresholds 
              thresholdLow={99}
              thresholdHigh={99.9}
            />
            <MetricDisplay 
              label="Load" 
              value={selectedNode.metrics.load} 
              unit="%" 
              showThresholds 
              thresholdLow={70}
              thresholdHigh={85}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Diagnostics</h4>
            <div className="flex gap-2">
              <Button onClick={handlePing} className="flex-1">
                <Zap className="h-4 w-4 mr-1" />
                Ping
              </Button>
              <Button onClick={handleTraceroute} variant="outline" className="flex-1">
                <Terminal className="h-4 w-4 mr-1" />
                Traceroute
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default NodeDetails;
