// API endpoints configuration
// These can be overridden by environment variables if available

// Network node type definition
export interface NetworkNodeConfig {
  id: string;
  name: string;
  ip: string;
  externalIp?: string;
  internalIp?: string;
  location: {
    lat: number;
    lng: number;
  };
  city: string;
  region: string;
  type: 'server' | 'router' | 'switch' | 'gateway';
}

// Network connection type definition
export interface NetworkConnectionConfig {
  id: string;
  source: string;
  target: string;
  bandwidth?: number;
}

// API Endpoint definition
export interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  nodeId?: string; // ID of the corresponding node (if applicable)
}

// Default development values - used when env vars are missing
const DEV_DEFAULTS = {
  NODES: [
    {
      id: "whiskey1",
      name: "Whiskey1",
      ip: "1.1.11.1",
      internalIp: "10.10.4.161",
      location: {
        lat: 40.7128,
        lng: -74.0060,
      },
      city: "New York",
      region: "NY",
      type: "server" as const,
    },
    {
      id: "whiskey2",
      name: "Whiskey2",
      ip: "1.2.12.1",
      internalIp: "10.10.4.162",
      location: {
        lat: 37.7749,
        lng: -122.4194,
      },
      city: "San Francisco",
      region: "CA",
      type: "server" as const,
    },
    {
      id: "router1",
      name: "Router1",
      ip: "1.1.11.2",
      location: {
        lat: 41.8781,
        lng: -87.6298,
      },
      city: "Chicago",
      region: "IL",
      type: "router" as const,
    },
    {
      id: "router2",
      name: "Router2",
      ip: "1.1.2.1",
      location: {
        lat: 39.9526,
        lng: -75.1652,
      },
      city: "Philadelphia",
      region: "PA",
      type: "router" as const,
    },
  ] as NetworkNodeConfig[],
  CONNECTIONS: [
    {
      id: "conn-whiskey1-router1",
      source: "whiskey1",
      target: "router1",
      bandwidth: 1000,
    },
    {
      id: "conn-router1-router2",
      source: "router1",
      target: "router2",
      bandwidth: 1000,
    },
    {
      id: "conn-router2-whiskey2",
      source: "router2",
      target: "whiskey2",
      bandwidth: 1000,
    },
  ],
  ENDPOINTS: [
    {
      id: 'whiskey1',
      name: 'Whiskey1',
      url: 'http://localhost:31800',
      nodeId: 'whiskey1'
    },
    {
      id: 'whiskey2',
      name: 'Whiskey2',
      url: 'http://localhost:31801',
      nodeId: 'whiskey2'
    }
  ]
};

// Parse a JSON array from environment variable or use default in dev mode
const parseEnvArray = <T>(envVar: string | undefined, defaultValue: T[] = []): T[] => {
  if (!envVar) return defaultValue;
  try {
    return JSON.parse(envVar) as T[];
  } catch (e) {
    console.warn(`Error parsing ${envVar} as JSON array, using default`, e);
    return defaultValue;
  }
};

// Utility to check if in development mode
export const isDev = (): boolean => {
  return import.meta.env.DEV === true;
};

// Parse API endpoints from environment
const parseApiEndpoints = (): ApiEndpoint[] => {
  const apiEndpointsEnv = import.meta.env.VITE_API_ENDPOINTS;
  
  if (apiEndpointsEnv) {
    try {
      return JSON.parse(apiEndpointsEnv);
    } catch (e) {
      console.warn('Error parsing VITE_API_ENDPOINTS, falling back to legacy format', e);
    }
  }
  
  // Fall back to legacy format (VITE_WHISKEY1_API and VITE_WHISKEY2_API)
  const endpoints = [];
  
  if (import.meta.env.VITE_WHISKEY1_API) {
    endpoints.push({
      id: 'whiskey1',
      name: 'Whiskey1',
      url: import.meta.env.VITE_WHISKEY1_API,
      nodeId: 'whiskey1'
    });
  }
  
  if (import.meta.env.VITE_WHISKEY2_API) {
    endpoints.push({
      id: 'whiskey2',
      name: 'Whiskey2',
      url: import.meta.env.VITE_WHISKEY2_API,
      nodeId: 'whiskey2'
    });
  }
  
  // If no endpoints found and in development mode, use defaults
  if (endpoints.length === 0 && isDev()) {
    console.warn('No API endpoints found in env, using development defaults');
    return DEV_DEFAULTS.ENDPOINTS;
  }
  
  return endpoints;
};

// Status thresholds configuration
export interface StatusThresholds {
  latency: {
    degraded: number;
    critical: number;
  };
  packetLoss: {
    degraded: number;
    critical: number;
  };
  uptime: {
    degraded: number;
    critical: number;
  };
}

// Parse thresholds from environment variables
const parseThresholds = (): StatusThresholds => {
  // First try to parse from JSON structure
  const thresholdsEnv = import.meta.env.VITE_STATUS_THRESHOLDS;
  if (thresholdsEnv) {
    try {
      return JSON.parse(thresholdsEnv) as StatusThresholds;
    } catch (e) {
      console.warn('Error parsing VITE_STATUS_THRESHOLDS, falling back to individual env vars', e);
    }
  }
  
  // Otherwise parse from individual env vars with fallbacks
  return {
    latency: {
      degraded: parseInt(import.meta.env.VITE_LATENCY_DEGRADED as string) || 50,
      critical: parseInt(import.meta.env.VITE_LATENCY_CRITICAL as string) || 100,
    },
    packetLoss: {
      degraded: parseInt(import.meta.env.VITE_PACKET_LOSS_DEGRADED as string) || 1,
      critical: parseInt(import.meta.env.VITE_PACKET_LOSS_CRITICAL as string) || 5,
    },
    uptime: {
      degraded: parseInt(import.meta.env.VITE_UPTIME_DEGRADED as string) || 99,
      critical: parseInt(import.meta.env.VITE_UPTIME_CRITICAL as string) || 95,
    }
  };
};

// Export the complete configuration
export const API_CONFIG = {
  // API endpoints
  API_ENDPOINTS: parseApiEndpoints(),
  
  // Available endpoints
  ENDPOINTS: {
    // Kept for backward compatibility, but should use API_ENDPOINTS instead
    WHISKEY1_API: import.meta.env.VITE_WHISKEY1_API || "http://localhost:31800", 
    WHISKEY2_API: import.meta.env.VITE_WHISKEY2_API || "http://localhost:31801",
  },
  
  // Endpoint paths
  PATHS: {
    TOPOLOGY: import.meta.env.VITE_TOPOLOGY_ENDPOINT || "/topology",
    HEALTH: import.meta.env.VITE_HEALTH_ENDPOINT || "/health",
    PING: import.meta.env.VITE_PING_ENDPOINT || "/ping",
    TRACEROUTE: import.meta.env.VITE_TRACEROUTE_ENDPOINT || "/traceroute",
    NETWORK_TEST: import.meta.env.VITE_NETWORK_TEST_ENDPOINT || "/network_test",
  },
  
  // Network topology
  TOPOLOGY: {
    // Network nodes (servers, routers, etc.)
    NODES: parseEnvArray<NetworkNodeConfig>(
      import.meta.env.VITE_NETWORK_NODES as string | undefined,
      isDev() ? DEV_DEFAULTS.NODES : []
    ),
    
    // Network connections
    CONNECTIONS: parseEnvArray<NetworkConnectionConfig>(
      import.meta.env.VITE_NETWORK_CONNECTIONS as string | undefined,
      isDev() ? DEV_DEFAULTS.CONNECTIONS : []
    ),
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_NETWORK_TEST: import.meta.env.VITE_ENABLE_NETWORK_TEST === "true" || isDev(),
    SHOW_REAL_ERRORS: import.meta.env.VITE_SHOW_REAL_ERRORS === "true" || isDev(),
    USE_MOCK_DATA_DEFAULT: import.meta.env.VITE_USE_MOCK_DATA_DEFAULT === "true" || isDev(),
  },
  
  // API settings
  SETTINGS: {
    API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT as string) || 10000,
    NETWORK_TEST_TIMEOUT: parseInt(import.meta.env.VITE_NETWORK_TEST_TIMEOUT as string) || 20000,
  },
  
  // Status thresholds for visual indicators
  STATUS_THRESHOLDS: parseThresholds(),
};

// Debug utility to log the current API configuration
export const logApiConfig = (): void => {
  console.log("API_CONFIG:", API_CONFIG);
}; 