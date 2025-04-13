import { generateMockPingResponse, generateMockTracerouteResponse } from "../data/mock-data";
import { DiagnosticResult, NodeStatus, NetworkNode, NetworkConnection } from "../types/network";
import { API_CONFIG, NetworkNodeConfig, NetworkConnectionConfig } from "../config/api-config";

// Convert the configuration node to an application node
const configNodeToAppNode = (configNode: NetworkNodeConfig, status: NodeStatus = 'unknown'): NetworkNode => {
  return {
    id: configNode.id,
    name: configNode.name,
    ip: configNode.ip,
    location: configNode.location,
    city: configNode.city,
    region: configNode.region,
    status,
    metrics: {
      latency: 0,
      packetLoss: 0,
      uptime: 100,
      load: 0
    },
    type: configNode.type,
  };
};

// Convert config connection to app connection
const configConnectionToAppConnection = (
  configConnection: NetworkConnectionConfig, 
  status: NodeStatus = 'unknown'
): NetworkConnection => {
  return {
    id: configConnection.id,
    source: configConnection.source,
    target: configConnection.target,
    status,
    metrics: {
      latency: 0,
      bandwidth: configConnection.bandwidth || 1000,
      packetLoss: 0,
      utilization: 0,
    },
  };
};

// Create real network data from config
const createRealNetworkData = (): { nodes: NetworkNode[], connections: NetworkConnection[] } => {
  // Create nodes from config, all with unknown status initially
  const nodes: NetworkNode[] = API_CONFIG.TOPOLOGY.NODES.map(
    configNode => configNodeToAppNode(configNode, 'unknown')
  );
  
  // Create connections from config, all with unknown status initially
  const connections: NetworkConnection[] = API_CONFIG.TOPOLOGY.CONNECTIONS.map(
    configConn => configConnectionToAppConnection(configConn, 'unknown')
  );
  
  return { nodes, connections };
};

// Helper to convert raw ping API response to our DiagnosticResult format
const processRealPingResponse = (data: any): DiagnosticResult => {
  // Extract packet loss percentage from stats
  const packetLoss = data.stats.packets.loss || 0;
  
  // Determine success based on packet loss (anything less than 100% is considered a partial success)
  const success = packetLoss < 100;
  
  // Format the results as a string array to match our existing UI format
  const results = [
    `PING ${data.host} (${data.host}) 56(84) bytes of data.`,
    ...data.responses.map((r: any) => 
      `${r.bytes} bytes from ${r.host}: icmp_seq=${r.icmp_seq} ttl=${r.ttl} time=${r.time} ms`
    ),
    `--- ${data.host} ping statistics ---`,
    `${data.stats.packets.transmitted} packets transmitted, ${data.stats.packets.received} received, ${packetLoss}% packet loss, time ${data.stats.packets.time}ms`,
    `rtt min/avg/max/mdev = ${data.stats.rtt.min}/${data.stats.rtt.avg}/${data.stats.rtt.max}/${data.stats.rtt["mdev "]} ms`
  ];

  return {
    timestamp: new Date().toISOString(),
    commandType: "ping",
    target: data.host,
    results,
    success,
    metrics: {
      minLatency: data.stats.rtt.min,
      maxLatency: data.stats.rtt.max,
      avgLatency: data.stats.rtt.avg,
      packetLoss
    }
  };
};

// Helper to convert raw traceroute API response to our DiagnosticResult format
const processRealTracerouteResponse = (data: any): DiagnosticResult => {
  // Determine success based on if the final hop matches the destination
  const success = data.hops.length > 0 && 
    data.hops[data.hops.length - 1].responses.some((r: any) => r.host === data.destination);
  
  // Format the results as a string array to match our existing UI format
  const results = [
    `traceroute to ${data.destination} (${data.destination}), 30 hops max, 60 byte packets`,
    ...data.hops.map((hop: any) => {
      const responses = hop.responses.map((r: any) => `${r.host} (${r.host}) ${r.time} ms`).join('  ');
      return `${hop.hop}  ${responses}`;
    })
  ];

  return {
    timestamp: new Date().toISOString(),
    commandType: "traceroute",
    target: data.destination,
    results,
    success
  };
};

// Helper to convert raw network test API response to our DiagnosticResult format
const processNetworkTestResponse = (data: any): DiagnosticResult => {
  // Extract metrics like jitter and packet loss from the network test results
  const jitterMs = data.end.streams[0]?.udp?.jitter_ms || 0;
  const lostPackets = data.end.streams[0]?.udp?.lost_packets || 0;
  const totalPackets = data.end.streams[0]?.udp?.packets || 1;
  const packetLoss = (lostPackets / totalPackets) * 100;
  
  // Format the results for display
  const results = [
    `Network test to ${data.start.connecting_to.host}:${data.start.connecting_to.port}`,
    `Protocol: ${data.start.test_start.protocol}`,
    `Duration: ${data.end.sum.seconds.toFixed(2)} seconds`,
    `Bits per second: ${Math.round(data.end.sum.bits_per_second)}`,
    `Jitter: ${jitterMs.toFixed(4)} ms`,
    `Packet loss: ${packetLoss.toFixed(2)}%`,
    `CPU utilization: ${data.end.cpu_utilization_percent.host_total.toFixed(2)}%`
  ];

  return {
    timestamp: new Date().toISOString(),
    commandType: "network_test",
    target: data.start.connecting_to.host,
    results,
    success: true,
    metrics: {
      // We don't have exact equivalents but we can map some values
      avgLatency: jitterMs,
      packetLoss
    }
  };
};

// Determine node status based on metrics and thresholds
const determineNodeStatus = (metrics: { latency?: number, packetLoss?: number }): NodeStatus => {
  const thresholds = API_CONFIG.TOPOLOGY.THRESHOLDS;
  
  // Default to unknown if no metrics provided
  if (!metrics.latency && !metrics.packetLoss) {
    return 'unknown';
  }
  
  // Check for critical conditions first
  if ((metrics.latency !== undefined && metrics.latency >= thresholds.latency.critical) ||
      (metrics.packetLoss !== undefined && metrics.packetLoss >= thresholds.packetLoss.critical)) {
    return 'critical';
  }
  
  // Then check for degraded conditions
  if ((metrics.latency !== undefined && metrics.latency >= thresholds.latency.degraded) ||
      (metrics.packetLoss !== undefined && metrics.packetLoss >= thresholds.packetLoss.degraded)) {
    return 'degraded';
  }
  
  // Otherwise healthy
  return 'healthy';
};

// Create an error diagnostic result
const createErrorDiagnosticResult = (
  target: string, 
  commandType: 'ping' | 'traceroute' | 'network_test', 
  error: any
): DiagnosticResult => {
  return {
    timestamp: new Date().toISOString(),
    commandType,
    target,
    results: [`Error: ${error.message || 'Unknown error'}`],
    success: false,
    metrics: {
      packetLoss: 100 // Assume 100% packet loss on error
    }
  };
};

// Network API services
export const NetworkAPI = {
  // Get real network topology data
  getNetworkData: async (): Promise<{ nodes: NetworkNode[], connections: NetworkConnection[] }> => {
    // Create initial network data from config
    return createRealNetworkData();
  },
  
  // Ping a target using either mock data or real API
  ping: async (targetIp: string, nodeStatus: NodeStatus, useMockData: boolean): Promise<DiagnosticResult> => {
    if (useMockData) {
      // Use mock data implementation
      return generateMockPingResponse(targetIp, nodeStatus);
    } else {
      // Determine which server to use based on IP patterns
      // Find a server node that has this target in its IP
      const serverNode = API_CONFIG.TOPOLOGY.NODES.find(
        node => node.type === 'server' && node.internalIp
      );
      
      if (!serverNode) {
        return createErrorDiagnosticResult(targetIp, "ping", new Error("No server node available"));
      }
      
      // Use the first server's API endpoint
      const isWhiskey1 = targetIp.startsWith('1.1');
      const apiEndpoint = isWhiskey1 ? 
        API_CONFIG.ENDPOINTS.WHISKEY1_API : 
        API_CONFIG.ENDPOINTS.WHISKEY2_API;
      
      try {
        const response = await fetch(`${apiEndpoint}/ping/${targetIp}`, {
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.DEFAULT)
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return processRealPingResponse(data);
      } catch (error) {
        console.error("Ping API error:", error);
        
        // If configured to show real errors, return an error result
        if (API_CONFIG.FEATURES.SHOW_REAL_ERRORS) {
          return createErrorDiagnosticResult(targetIp, "ping", error);
        }
        
        // Otherwise fall back to mock data on error, but with critical status
        return generateMockPingResponse(targetIp, "critical");
      }
    }
  },
  
  // Traceroute to a target using either mock data or real API
  traceroute: async (targetIp: string, nodeStatus: NodeStatus, useMockData: boolean): Promise<DiagnosticResult> => {
    if (useMockData) {
      // Use mock data implementation
      return generateMockTracerouteResponse(targetIp, nodeStatus);
    } else {
      // Determine which server to use based on IP patterns
      const isWhiskey1 = targetIp.startsWith('1.1');
      const apiEndpoint = isWhiskey1 ? 
        API_CONFIG.ENDPOINTS.WHISKEY1_API : 
        API_CONFIG.ENDPOINTS.WHISKEY2_API;
      
      try {
        const response = await fetch(`${apiEndpoint}/traceroute/${targetIp}`, {
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.DEFAULT)
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return processRealTracerouteResponse(data);
      } catch (error) {
        console.error("Traceroute API error:", error);
        
        // If configured to show real errors, return an error result
        if (API_CONFIG.FEATURES.SHOW_REAL_ERRORS) {
          return createErrorDiagnosticResult(targetIp, "traceroute", error);
        }
        
        // Otherwise fall back to mock data on error, but with critical status
        return generateMockTracerouteResponse(targetIp, "critical");
      }
    }
  },
  
  // Network test to a target using real API (only available in real mode)
  networkTest: async (targetIp: string): Promise<DiagnosticResult> => {
    if (!API_CONFIG.FEATURES.ENABLE_NETWORK_TEST) {
      return {
        timestamp: new Date().toISOString(),
        commandType: "network_test",
        target: targetIp,
        results: ["Network test feature is disabled"],
        success: false
      };
    }
    
    // Determine which server to use based on IP patterns
    const isWhiskey1 = targetIp.startsWith('1.1');
    const apiEndpoint = isWhiskey1 ? 
      API_CONFIG.ENDPOINTS.WHISKEY1_API : 
      API_CONFIG.ENDPOINTS.WHISKEY2_API;
    
    try {
      const response = await fetch(`${apiEndpoint}/network_test/${targetIp}`, {
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.NETWORK_TEST)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return processNetworkTestResponse(data);
    } catch (error) {
      console.error("Network test API error:", error);
      
      // Always show real errors for network test
      return createErrorDiagnosticResult(targetIp, "network_test", error);
    }
  },
  
  // Helper to determine node status based on diagnostic results
  determineStatus: determineNodeStatus,
}; 