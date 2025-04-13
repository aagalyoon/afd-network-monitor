import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockNodes, mockConnections } from '../data/mock-data';
import { NetworkNode, NetworkConnection, NodeStatus, DiagnosticResult, NetworkDataState } from '../types/network';
import { toast } from '@/components/ui/use-toast';
import { NetworkAPI } from '@/services/network-api';
import { useSettings } from './settings-context';

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
      status: ['healthy', 'degraded', 'critical'],
      searchTerm: '',
    },
  });
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('nodes');
  const [popupNodeId, setPopupNodeId] = useState<string | null>(null);

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

  // Initial app loading simulation for user experience
  useEffect(() => {
    // Simulate initial node data loading
    toast({
      title: "Network Data Loaded",
      description: `Loaded ${networkData.nodes.length} nodes and ${networkData.connections.length} connections`,
    });
  }, []);

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
