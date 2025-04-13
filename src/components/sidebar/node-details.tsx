import React from 'react';
import { useNetwork } from '@/context/network-context';
import { useSettings } from '@/context/settings-context';
import StatusBadge from '@/components/ui/status-badge';
import MetricDisplay from '@/components/ui/metric-display';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Network, Zap, Terminal, Router, Server, X, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const NodeDetails: React.FC = () => {
  const { selectedNodeId, getNodeById, pingNode, tracerouteNode, networkTestNode, selectNode } = useNetwork();
  const { useMockData } = useSettings();
  
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
  
  const handleNetworkTest = () => {
    networkTestNode(selectedNode.id);
  };
  
  return (
    <ScrollArea className="h-full">
      <div className="p-4 pb-8">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {getNodeIcon()}
              {selectedNode.name}
            </h3>
            <div className="text-sm text-muted-foreground">{selectedNode.ip}</div>
            <div className="mt-1">
              <StatusBadge status={selectedNode.status} />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => selectNode(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="my-4">
          <div className="text-sm font-medium mb-2">Location</div>
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <div className="text-muted-foreground">City</div>
            <div>{selectedNode.city}</div>
            <div className="text-muted-foreground">Region</div>
            <div>{selectedNode.region}</div>
            <div className="text-muted-foreground">Coordinates</div>
            <div>{selectedNode.location.lat.toFixed(4)}, {selectedNode.location.lng.toFixed(4)}</div>
          </div>
        </div>
        
        <div className="my-4">
          <div className="text-sm font-medium mb-2">Metrics</div>
          <div className="grid grid-cols-2 gap-2">
            <MetricDisplay
              label="Latency"
              value={selectedNode.metrics.latency}
              unit="ms"
              status={
                selectedNode.metrics.latency < 30
                  ? 'healthy'
                  : selectedNode.metrics.latency < 80
                  ? 'degraded'
                  : 'critical'
              }
            />
            <MetricDisplay
              label="Packet Loss"
              value={selectedNode.metrics.packetLoss}
              unit="%"
              status={
                selectedNode.metrics.packetLoss < 1
                  ? 'healthy'
                  : selectedNode.metrics.packetLoss < 5
                  ? 'degraded'
                  : 'critical'
              }
            />
            <MetricDisplay
              label="Uptime"
              value={selectedNode.metrics.uptime}
              unit="%"
              status={
                selectedNode.metrics.uptime > 99.9
                  ? 'healthy'
                  : selectedNode.metrics.uptime > 99
                  ? 'degraded'
                  : 'critical'
              }
            />
            <MetricDisplay
              label="Load"
              value={selectedNode.metrics.load}
              unit="%"
              status={
                selectedNode.metrics.load < 70
                  ? 'healthy'
                  : selectedNode.metrics.load < 90
                  ? 'degraded'
                  : 'critical'
              }
            />
          </div>
        </div>
        
        <div className="my-4">
          <div className="text-sm font-medium mb-2">Diagnostics</div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handlePing} size="sm" className="flex gap-1">
                  <Zap className="h-4 w-4" />
                  Ping
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {useMockData 
                  ? "Using mock data - Toggle settings for real API calls" 
                  : "Using real API - Calls Whiskey servers"}
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleTraceroute} size="sm" className="flex gap-1">
                  <Terminal className="h-4 w-4" />
                  Traceroute
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {useMockData 
                  ? "Using mock data - Toggle settings for real API calls" 
                  : "Using real API - Calls Whiskey servers"}
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleNetworkTest} 
                  size="sm" 
                  className="flex gap-1"
                  disabled={useMockData}
                >
                  <Activity className="h-4 w-4" />
                  Network Test
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {useMockData 
                  ? "Only available in real data mode" 
                  : "Runs iperf3 performance test via API"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default NodeDetails;
