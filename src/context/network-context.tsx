import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockNodes, mockConnections } from '../data/mock-data';
import { NetworkNode, NetworkConnection, NodeStatus, DiagnosticResult, NetworkDataState } from '../types/network';
import { toast } from '@/components/ui/use-toast';
import { NetworkAPI } from '@/services/network-api';
import { useSettings } from './settings-context';
import { API_CONFIG, logApiConfig } from '@/config/api-config';

type ActiveTab = 'nodes' | 'details' | 'diagnostics';

interface NetworkContextType {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  selectedNodeId: string | null;
  popupNodeId: string | null;
  activeTab: ActiveTab;
  diagnostics: DiagnosticResult[];
  filteredNodes: NetworkNode[];
  filters: {
    status: NodeStatus[];
    searchTerm: string;
  };
  selectNode: (nodeId: string | null) => void;
  showNodePopup: (nodeId: string | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  pingNode: (nodeId: string) => void;
  tracerouteNode: (nodeId: string) => void;
  networkTestNode: (nodeId: string) => void;
  updateFilters: (filters: Partial<NetworkDataState['filters']>) => void;
  getNodeById: (nodeId: string) => NetworkNode | undefined;
  getConnectionsForNode: (nodeId: string) => NetworkConnection[];
  refreshNetworkData: () => Promise<void>;
  isLoading: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { useMockData } = useSettings();
  
  const [networkData, setNetworkData] = useState<NetworkDataState>({
    nodes: mockNodes,
    connections: mockConnections,
    selectedNodeId: null,
    diagnostics: [],
    filters: {
      status: ['healthy', 'degraded', 'critical', 'unknown'],
      searchTerm: '',
    },
  });
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('nodes');
  const [popupNodeId, setPopupNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load network data based on mock mode setting
  const loadNetworkData = async () => {
    setIsLoading(true);
    console.log(`[Network] Loading network data with mock mode: ${useMockData}`);
    try {
      if (useMockData) {
        // Use mock data
        console.log(`[Network] Using mock data: ${mockNodes.length} nodes, ${mockConnections.length} connections`);
        setNetworkData(prev => ({
          ...prev,
          nodes: mockNodes,
          connections: mockConnections,
        }));
        toast({
          title: "Network Data",
          description: `Loaded ${mockNodes.length} nodes and ${mockConnections.length} connections`,
          variant: "default"
        });
      } else {
        // Use real data from API
        console.log("[Network] Fetching real network data from API...");
        const { nodes, connections } = await NetworkAPI.getNetworkData(useMockData);
        console.log(`[Network] API returned ${nodes.length} nodes and ${connections.length} connections`);
        setNetworkData(prev => ({
          ...prev,
          nodes,
          connections,
        }));
        toast({
          title: "Network Data",
          description: `Loaded ${nodes.length} nodes and ${connections.length} connections`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("[Network] Error loading network data:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load network data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reload data when mock mode changes
  useEffect(() => {
    loadNetworkData();
    // Log API configuration in development
    logApiConfig();
  }, [useMockData]);

  // Filter nodes based on current filters
  const filteredNodes = networkData.nodes.filter((node) => {
    const matchesStatus = networkData.filters.status.includes(node.status);
    const matchesSearch = networkData.filters.searchTerm 
      ? node.name.toLowerCase().includes(networkData.filters.searchTerm.toLowerCase()) ||
        node.ip.includes(networkData.filters.searchTerm) ||
        node.city.toLowerCase().includes(networkData.filters.searchTerm.toLowerCase())
      : true;
    
    return matchesStatus && matchesSearch;
  });

  // Set selected node
  const selectNode = (nodeId: string | null) => {
    setNetworkData((prev) => ({
      ...prev,
      selectedNodeId: nodeId,
    }));
  };
  
  // Set node to show popup for
  const showNodePopup = (nodeId: string | null) => {
    setPopupNodeId(nodeId);
  };

  // Run ping command
  const pingNode = (nodeId: string) => {
    const node = networkData.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    
    // Show notification that ping is running
    toast({
      title: `Pinging ${node.name}`,
      description: `Running ping to ${node.ip}...`,
    });
    
    // Call ping API (real or mock)
    const pingPromise = NetworkAPI.ping(node.ip, node.status, useMockData);
    
    // Handle the result
    pingPromise.then(pingResult => {
      setNetworkData((prev) => ({
        ...prev,
        diagnostics: [pingResult, ...prev.diagnostics.slice(0, 9)], // Keep last 10 entries
      }));
      
      toast({
        title: `Ping ${pingResult.success ? 'successful' : 'failed'}`,
        description: `Pinged ${node.name} (${node.ip}) with ${pingResult.metrics?.packetLoss}% packet loss`,
        variant: pingResult.success ? 'default' : 'destructive',
      });

      // Update node metrics and status if we're using real data
      if (!useMockData && pingResult.metrics) {
        updateNodeMetrics(nodeId, {
          latency: pingResult.metrics.avgLatency || 0,
          packetLoss: pingResult.metrics.packetLoss || 0
        });
      }
    });
  };

  // Run traceroute command
  const tracerouteNode = (nodeId: string) => {
    const node = networkData.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    
    // Show notification that traceroute is running
    toast({
      title: `Traceroute to ${node.name}`,
      description: `Running traceroute to ${node.ip}...`,
    });
    
    // Call traceroute API (real or mock)
    const traceroutePromise = NetworkAPI.traceroute(node.ip, node.status, useMockData);
    
    // Handle the result
    traceroutePromise.then(tracerouteResult => {
      setNetworkData((prev) => ({
        ...prev,
        diagnostics: [tracerouteResult, ...prev.diagnostics.slice(0, 9)], // Keep last 10 entries
      }));
      
      toast({
        title: `Traceroute ${tracerouteResult.success ? 'completed' : 'incomplete'}`,
        description: `Traceroute to ${node.name} (${node.ip}) completed with ${tracerouteResult.results.length} hops`,
        variant: tracerouteResult.success ? 'default' : 'destructive',
      });

      // If traceroute failed and we're using real data, update the node status
      if (!useMockData && !tracerouteResult.success) {
        updateNodeStatus(nodeId, 'critical');
      }
    });
  };
  
  // Run network test command (only available in real data mode)
  const networkTestNode = (nodeId: string) => {
    // This feature is only available in real data mode
    if (useMockData) {
      toast({
        title: "Network Test Unavailable",
        description: "Network test is only available in real data mode. Turn off mock mode to use this feature.",
        variant: "destructive",
      });
      return;
    }
    
    const node = networkData.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    
    // Show notification that network test is running
    toast({
      title: `Network Test to ${node.name}`,
      description: `Running network performance test to ${node.ip}...`,
    });
    
    // Call network test API
    const networkTestPromise = NetworkAPI.networkTest(node.ip);
    
    // Handle the result
    networkTestPromise.then(networkTestResult => {
      setNetworkData((prev) => ({
        ...prev,
        diagnostics: [networkTestResult, ...prev.diagnostics.slice(0, 9)], // Keep last 10 entries
      }));
      
      toast({
        title: `Network Test ${networkTestResult.success ? 'completed' : 'failed'}`,
        description: `Network test to ${node.name} (${node.ip}) completed`,
        variant: networkTestResult.success ? 'default' : 'destructive',
      });

      // Update node metrics from test result
      if (networkTestResult.metrics) {
        updateNodeMetrics(nodeId, {
          latency: networkTestResult.metrics.avgLatency,
          packetLoss: networkTestResult.metrics.packetLoss
        });
      }
    });
  };

  // Update filters
  const updateFilters = (filters: Partial<NetworkDataState['filters']>) => {
    setNetworkData((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  };

  // Helper to get node by ID
  const getNodeById = (nodeId: string) => {
    return networkData.nodes.find((node) => node.id === nodeId);
  };

  // Helper to get connections for a node
  const getConnectionsForNode = (nodeId: string) => {
    return networkData.connections.filter(
      (conn) => conn.source === nodeId || conn.target === nodeId
    );
  };

  // Helper to directly update a node's status
  const updateNodeStatus = (nodeId: string, status: NodeStatus) => {
    setNetworkData((prev) => {
      const updatedNodes = prev.nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, status };
        }
        return node;
      });
      
      // Also update any connections this node is part of
      const updatedConnections = prev.connections.map(conn => {
        if (conn.source === nodeId || conn.target === nodeId) {
          // If one end of the connection is critical, mark the connection as critical
          if (status === 'critical') {
            return { ...conn, status: 'critical' as NodeStatus };
          }
          // If degraded, only mark as degraded if not already critical
          else if (status === 'degraded' && conn.status !== 'critical') {
            return { ...conn, status: 'degraded' as NodeStatus };
          }
        }
        return conn;
      });
      
      return { 
        ...prev, 
        nodes: updatedNodes,
        connections: updatedConnections
      };
    });
  };

  // Helper to update node metrics based on diagnostic results
  const updateNodeMetrics = (nodeId: string, metrics: { latency?: number, packetLoss?: number }) => {
    setNetworkData((prev) => {
      // Find the node to update
      const updatedNodes = prev.nodes.map(node => {
        if (node.id === nodeId) {
          // Update the metrics
          const updatedMetrics = { ...node.metrics };
          if (metrics.latency !== undefined) updatedMetrics.latency = metrics.latency;
          if (metrics.packetLoss !== undefined) updatedMetrics.packetLoss = metrics.packetLoss;
          
          // Determine new status based on thresholds from API config
          const newStatus = NetworkAPI.determineStatus(metrics);
          
          return { 
            ...node, 
            metrics: updatedMetrics, 
            status: newStatus
          };
        }
        return node;
      });
      
      // Find any connections that this node is part of
      const nodeStatus = updatedNodes.find(n => n.id === nodeId)?.status || 'unknown';
      const updatedConnections = prev.connections.map(conn => {
        if (conn.source === nodeId || conn.target === nodeId) {
          // If node is critical, connection is critical
          if (nodeStatus === 'critical') {
            return { ...conn, status: 'critical' as NodeStatus };
          }
          // If node is degraded, connection is degraded (unless already critical)
          else if (nodeStatus === 'degraded' && conn.status !== 'critical') {
            return { ...conn, status: 'degraded' as NodeStatus };
          }
          // Otherwise connections stay as-is
        }
        return conn;
      });
      
      return { 
        ...prev, 
        nodes: updatedNodes,
        connections: updatedConnections
      };
    });
  };

  // Function to manually refresh network data
  const refreshNetworkData = async () => {
    await loadNetworkData();
  };

  return (
    <NetworkContext.Provider
      value={{
        nodes: networkData.nodes,
        connections: networkData.connections,
        selectedNodeId: networkData.selectedNodeId,
        popupNodeId,
        activeTab,
        diagnostics: networkData.diagnostics,
        filteredNodes,
        filters: networkData.filters,
        selectNode,
        showNodePopup,
        setActiveTab,
        pingNode,
        tracerouteNode,
        networkTestNode,
        updateFilters,
        getNodeById,
        getConnectionsForNode,
        refreshNetworkData,
        isLoading,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
