import { NetworkNode, NetworkConnection, NodeStatus } from "../types/network";

export const mockNodes: NetworkNode[] = [
  {
    id: "node-1",
    name: "Whiskey1",
    ip: "10.0.1.1",
    location: {
      lat: 40.7128,
      lng: -74.0060,
    },
    city: "New York",
    region: "NY",
    status: "healthy",
    metrics: {
      latency: 12,
      packetLoss: 0.1,
      uptime: 99.99,
      load: 45,
    },
    type: "server",
  },
  {
    id: "node-2",
    name: "Whiskey2",
    ip: "10.0.2.1",
    location: {
      lat: 37.7749,
      lng: -122.4194,
    },
    city: "San Francisco",
    region: "CA",
    status: "healthy",
    metrics: {
      latency: 18,
      packetLoss: 0.2,
      uptime: 99.95,
      load: 62,
    },
    type: "server",
  },
  {
    id: "node-3",
    name: "Cognac1",
    ip: "10.0.3.1",
    location: {
      lat: 41.8781,
      lng: -87.6298,
    },
    city: "Chicago",
    region: "IL",
    status: "degraded",
    metrics: {
      latency: 35,
      packetLoss: 2.5,
      uptime: 98.7,
      load: 78,
    },
    type: "server",
  },
  {
    id: "node-4",
    name: "Cognac2",
    ip: "10.0.4.1",
    location: {
      lat: 30.2672,
      lng: -97.7431,
    },
    city: "Austin",
    region: "TX",
    status: "critical",
    metrics: {
      latency: 110,
      packetLoss: 6.8,
      uptime: 93.4,
      load: 91,
    },
    type: "server",
  },
  {
    id: "node-5",
    name: "Cognac3",
    ip: "10.0.5.1",
    location: {
      lat: 39.2037,
      lng: -76.8610,
    },
    city: "Columbia",
    region: "MD",
    status: "healthy",
    metrics: {
      latency: 15,
      packetLoss: 0.2,
      uptime: 99.98,
      load: 38,
    },
    type: "server",
  },
  {
    id: "node-6",
    name: "Cognac4",
    ip: "10.0.6.1",
    location: {
      lat: 39.2904,
      lng: -76.6122,
    },
    city: "Baltimore",
    region: "MD",
    status: "healthy",
    metrics: {
      latency: 28,
      packetLoss: 1.5,
      uptime: 99.2,
      load: 68,
    },
    type: "server",
  },
  {
    id: "node-7",
    name: "Cognac5",
    ip: "10.0.7.1",
    location: {
      lat: 39.7392,
      lng: -104.9903,
    },
    city: "Denver",
    region: "CO",
    status: "healthy",
    metrics: {
      latency: 22,
      packetLoss: 0.3,
      uptime: 99.95,
      load: 52,
    },
    type: "server",
  },
  {
    id: "node-8",
    name: "Cognac6",
    ip: "10.0.8.1",
    location: {
      lat: 28.5383,
      lng: -81.3792,
    },
    city: "Orlando",
    region: "FL",
    status: "healthy",
    metrics: {
      latency: 14,
      packetLoss: 0.1,
      uptime: 99.97,
      load: 40,
    },
    type: "server",
  }
];

export const mockConnections: NetworkConnection[] = [
  {
    id: "conn-1-2",
    source: "node-1",
    target: "node-2",
    status: "healthy",
    metrics: {
      latency: 72,
      bandwidth: 1000,
      packetLoss: 0.1,
      utilization: 42,
    },
  },
  {
    id: "conn-1-3",
    source: "node-1",
    target: "node-3",
    status: "degraded",
    metrics: {
      latency: 85,
      bandwidth: 750,
      packetLoss: 3.5,
      utilization: 72,
    },
  },
  {
    id: "conn-5-6",
    source: "node-5",
    target: "node-6",
    status: "healthy",
    metrics: {
      latency: 12,
      bandwidth: 1000,
      packetLoss: 0.1,
      utilization: 30,
    },
  },
  {
    id: "conn-5-8",
    source: "node-5",
    target: "node-8",
    status: "healthy",
    metrics: {
      latency: 32,
      bandwidth: 1000,
      packetLoss: 0.2,
      utilization: 45,
    },
  },
  {
    id: "conn-6-8",
    source: "node-6",
    target: "node-8",
    status: "healthy",
    metrics: {
      latency: 35,
      bandwidth: 1000,
      packetLoss: 0.3,
      utilization: 38,
    },
  }
];

// Generate mock ping response
export const generateMockPingResponse = (targetIp: string, status: NodeStatus) => {
  const timestamp = new Date().toISOString();
  const success = status !== "critical";
  const latency = status === "healthy" ? 12 : status === "degraded" ? 120 : 250;
  const packetLoss = status === "healthy" ? 0 : status === "degraded" ? 15 : 80;
  
  const results = [
    `PING ${targetIp} (${targetIp}) 56(84) bytes of data.`,
  ];
  
  if (success) {
    for (let i = 0; i < 4; i++) {
      const variance = Math.floor(Math.random() * 5);
      results.push(`64 bytes from ${targetIp}: icmp_seq=${i + 1} ttl=64 time=${latency + variance} ms`);
    }
    results.push(`--- ${targetIp} ping statistics ---`);
    results.push(`4 packets transmitted, ${status === "degraded" ? "3" : "4"} received, ${packetLoss}% packet loss, time ${status === "degraded" ? "3007" : "3004"}ms`);
    results.push(`rtt min/avg/max/mdev = ${latency-2}/${latency}/${latency+5}/${latency * 0.1} ms`);
  } else {
    for (let i = 0; i < 4; i++) {
      if (i < 3) {
        results.push(`No response from ${targetIp}: icmp_seq=${i + 1}`);
      } else {
        const variance = Math.floor(Math.random() * 150);
        results.push(`64 bytes from ${targetIp}: icmp_seq=${i + 1} ttl=64 time=${latency + variance} ms`);
      }
    }
    results.push(`--- ${targetIp} ping statistics ---`);
    results.push(`4 packets transmitted, 1 received, ${packetLoss}% packet loss, time 3009ms`);
    results.push(`rtt min/avg/max/mdev = ${latency}/${latency}/${latency}/${latency * 0.1} ms`);
  }
  
  return {
    timestamp,
    commandType: "ping" as const,
    target: targetIp,
    results,
    success,
    metrics: {
      minLatency: latency - 2,
      maxLatency: latency + 5,
      avgLatency: latency,
      packetLoss
    }
  };
};

// Generate mock traceroute response
export const generateMockTracerouteResponse = (targetIp: string, status: NodeStatus) => {
  const timestamp = new Date().toISOString();
  const success = status !== "critical";
  
  const results = [
    `traceroute to ${targetIp} (${targetIp}), 30 hops max, 60 byte packets`,
  ];
  
  // Create some mock hops
  const hopCount = status === "healthy" ? 5 : status === "degraded" ? 8 : 12;
  
  for (let i = 1; i <= hopCount; i++) {
    const baseLatency = i * 10;
    
    if (status === "critical" && i > hopCount - 3) {
      results.push(`${i}  * * *`);
    } else {
      const hop = {
        ip: `192.168.${Math.floor(i/2)}.${i*10}`,
        name: `hop-${i}.example.com`,
        latency1: baseLatency + Math.floor(Math.random() * 5),
        latency2: baseLatency + Math.floor(Math.random() * 5),
        latency3: baseLatency + Math.floor(Math.random() * 5),
      };
      
      results.push(`${i}  ${hop.name} (${hop.ip})  ${hop.latency1} ms  ${hop.latency2} ms  ${hop.latency3} ms`);
    }
  }
  
  if (success) {
    const finalLatency = hopCount * 10 + Math.floor(Math.random() * 10);
    results.push(`${hopCount + 1}  ${targetIp} (${targetIp})  ${finalLatency} ms  ${finalLatency + 2} ms  ${finalLatency + 1} ms`);
  }
  
  return {
    timestamp,
    commandType: "traceroute" as const,
    target: targetIp,
    results,
    success
  };
};
