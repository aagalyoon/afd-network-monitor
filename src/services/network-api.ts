import { generateMockPingResponse, generateMockTracerouteResponse } from "../data/mock-data";
import { DiagnosticResult, NodeStatus } from "../types/network";

// Real API endpoints
const WHISKEY1_API = "http://10.10.4.161:31800";
const WHISKEY2_API = "http://10.10.4.162:31800";

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

// Network API services
export const NetworkAPI = {
  // Ping a target using either mock data or real API
  ping: async (targetIp: string, nodeStatus: NodeStatus, useMockData: boolean): Promise<DiagnosticResult> => {
    if (useMockData) {
      // Use mock data implementation
      return generateMockPingResponse(targetIp, nodeStatus);
    } else {
      // Determine which server to use based on IP patterns
      // This is a simple heuristic - in a real app, we might have more sophisticated routing
      const isWhiskey1 = targetIp.startsWith('1.1');
      const apiEndpoint = isWhiskey1 ? WHISKEY1_API : WHISKEY2_API;
      
      try {
        const response = await fetch(`${apiEndpoint}/ping/${targetIp}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return processRealPingResponse(data);
      } catch (error) {
        console.error("Ping API error:", error);
        // Fallback to mock data on error
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
      const apiEndpoint = isWhiskey1 ? WHISKEY1_API : WHISKEY2_API;
      
      try {
        const response = await fetch(`${apiEndpoint}/traceroute/${targetIp}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return processRealTracerouteResponse(data);
      } catch (error) {
        console.error("Traceroute API error:", error);
        // Fallback to mock data on error
        return generateMockTracerouteResponse(targetIp, "critical");
      }
    }
  },
  
  // Network test to a target using real API (only available in real mode)
  networkTest: async (targetIp: string): Promise<DiagnosticResult> => {
    // Always uses real data - this is only available when not in mock mode
    // Determine which server to use based on IP patterns
    const isWhiskey1 = targetIp.startsWith('1.1');
    const apiEndpoint = isWhiskey1 ? WHISKEY1_API : WHISKEY2_API;
    
    try {
      const response = await fetch(`${apiEndpoint}/network_test/${targetIp}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return processNetworkTestResponse(data);
    } catch (error) {
      console.error("Network test API error:", error);
      // Return a simple error result
      return {
        timestamp: new Date().toISOString(),
        commandType: "network_test",
        target: targetIp,
        results: [`Error running network test: ${error}`],
        success: false
      };
    }
  }
}; 