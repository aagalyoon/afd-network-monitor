
export type NodeStatus = 'healthy' | 'degraded' | 'critical';

export interface NetworkNode {
  id: string;
  name: string;
  ip: string;
  location: {
    lat: number;
    lng: number;
  };
  city: string;
  region: string;
  status: NodeStatus;
  metrics: {
    latency: number; // ms
    packetLoss: number; // percentage
    uptime: number; // percentage
    load: number; // percentage
  };
  type: 'server' | 'router' | 'switch' | 'gateway';
}

export interface NetworkConnection {
  id: string;
  source: string;
  target: string;
  status: NodeStatus;
  metrics: {
    latency: number; // ms
    bandwidth: number; // Mbps
    packetLoss: number; // percentage
    utilization: number; // percentage
  };
}

export interface DiagnosticResult {
  timestamp: string;
  commandType: 'ping' | 'traceroute';
  target: string;
  results: string[];
  success: boolean;
  metrics?: {
    minLatency?: number;
    maxLatency?: number;
    avgLatency?: number;
    packetLoss?: number;
  };
}

export type NetworkDataState = {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  selectedNodeId: string | null;
  diagnostics: DiagnosticResult[];
  filters: {
    status: NodeStatus[];
    searchTerm: string;
  };
};
