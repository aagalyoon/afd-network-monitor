import React, { useMemo } from 'react';
import { useNetwork } from '@/context/network-context';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/ui/status-badge';

const NetworkSummary: React.FC = () => {
  const { nodes } = useNetwork();
  
  // Calculate network health metrics
  const metrics = useMemo(() => {
    const totalNodes = nodes.length;
    const healthyNodes = nodes.filter(node => node.status === 'healthy').length;
    const degradedNodes = nodes.filter(node => node.status === 'degraded').length;
    const criticalNodes = nodes.filter(node => node.status === 'critical').length;
    
    // Calculate average latency across all nodes
    const avgLatency = nodes.reduce((sum, node) => sum + node.metrics.latency, 0) / totalNodes;
    
    // Calculate average packet loss across all nodes
    const avgPacketLoss = nodes.reduce((sum, node) => sum + node.metrics.packetLoss, 0) / totalNodes;
    
    // Calculate overall health score (0-100)
    const healthScore = Math.round((healthyNodes * 100 + degradedNodes * 50) / totalNodes);
    
    return {
      totalNodes,
      healthyNodes,
      degradedNodes,
      criticalNodes,
      avgLatency: avgLatency.toFixed(1),
      avgPacketLoss: avgPacketLoss.toFixed(1),
      healthScore
    };
  }, [nodes]);
  
  return (
    <div className="p-4 border-b">
      <h2 className="text-sm font-medium mb-2">Network Summary</h2>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Health Score</div>
            <div 
              className={`text-lg font-semibold ${
                metrics.healthScore >= 90 
                  ? 'text-healthy' 
                  : metrics.healthScore >= 70 
                    ? 'text-degraded' 
                    : 'text-critical'
              }`}
            >
              {metrics.healthScore}%
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs mb-3 justify-center">
            <div className="flex gap-1 items-center">
              <StatusBadge status="healthy" showText={false} size="sm" />
              <span>{metrics.healthyNodes} Healthy</span>
            </div>
            <div className="flex gap-1 items-center">
              <StatusBadge status="degraded" showText={false} size="sm" />
              <span>{metrics.degradedNodes} Degraded</span>
            </div>
            <div className="flex gap-1 items-center">
              <StatusBadge status="critical" showText={false} size="sm" />
              <span>{metrics.criticalNodes} Critical</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>
              <span className="text-muted-foreground">Avg Latency:</span>{' '}
              <span>{metrics.avgLatency} ms</span>
            </div>
            <div className="flex justify-end">
              <span className="text-muted-foreground">Avg Packet Loss:</span>
              <span>{metrics.avgPacketLoss}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkSummary;
