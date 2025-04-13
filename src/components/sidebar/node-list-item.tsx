import React from 'react';
import { NetworkNode } from '@/types/network';
import StatusBadge from '@/components/ui/status-badge';
import { useNetwork } from '@/context/network-context';
import { cn } from '@/lib/utils';
import { Server, Cpu, Workflow, Database, Monitor } from 'lucide-react';

interface NodeListItemProps {
  node: NetworkNode;
}

// Function to determine the icon based on node type
function getNodeIcon(type: string) {
  switch (type) {
    case 'server':
      return <Server className="h-3.5 w-3.5" />;
    case 'router':
      return <Workflow className="h-3.5 w-3.5" />;
    case 'switch':
      return <Cpu className="h-3.5 w-3.5" />;
    case 'database':
      return <Database className="h-3.5 w-3.5" />;
    default:
      return <Monitor className="h-3.5 w-3.5" />;
  }
}

const NodeListItem: React.FC<NodeListItemProps> = ({ node }) => {
  const { selectNode, selectedNodeId, showNodePopup } = useNetwork();

  const handleClick = () => {
    selectNode(node.id);
    showNodePopup(node.id);
  };

  const isSelected = selectedNodeId === node.id;
  
  // Map status to color class
  const statusColorClass = 
    node.status === 'healthy' ? 'bg-healthy' : 
    node.status === 'degraded' ? 'bg-degraded' : 
    'bg-critical';

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 cursor-pointer hover:bg-primary/10 transition-colors',
        isSelected && 'bg-primary/10'
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-center text-primary">
        {getNodeIcon(node.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="font-medium truncate">{node.name}</div>
          <StatusBadge status={node.status} size="sm" />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            {node.city}, {node.region}
          </div>
          <div className="font-mono">{node.ip}</div>
        </div>
        
        <div className="mt-1 grid grid-cols-2 gap-x-2 text-xs">
          <div>
            <span className="text-muted-foreground">Latency:</span>{' '}
            <span className={node.metrics.latency > 100 ? 'text-critical' : node.metrics.latency > 50 ? 'text-degraded' : ''}>
              {node.metrics.latency} ms
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Packet Loss:</span>{' '}
            <span className={node.metrics.packetLoss > 1 ? 'text-critical' : node.metrics.packetLoss > 0.5 ? 'text-degraded' : ''}>
              {node.metrics.packetLoss}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeListItem;
