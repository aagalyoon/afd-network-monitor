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

// Parse a JSON array from environment variable or use default
const parseEnvArray = <T>(envVar: string | undefined, defaultValue: T[]): T[] => {
  if (!envVar) return defaultValue;
  try {
    return JSON.parse(envVar) as T[];
  } catch (e) {
    console.warn(`Error parsing ${envVar} as JSON array, using default`, e);
    return defaultValue;
  }
};

// Default nodes configuration if not provided in env
const DEFAULT_NODES: NetworkNodeConfig[] = [
  {
    id: "whiskey1",
    name: "Whiskey1",
    ip: "1.1.11.1", // External IP
    internalIp: "10.10.4.161", // Internal IP
    location: {
      lat: 40.7128, // New York (example)
      lng: -74.0060,
    },
    city: "New York",
    region: "NY",
    type: "server",
  },
  {
    id: "whiskey2",
    name: "Whiskey2",
    ip: "1.2.12.1", // External IP
    internalIp: "10.10.4.162", // Internal IP
    location: {
      lat: 37.7749, // San Francisco (example)
      lng: -122.4194,
    },
    city: "San Francisco",
    region: "CA",
    type: "server",
  },
  {
    id: "router1",
    name: "Router1",
    ip: "1.1.11.2",
    location: {
      lat: 41.8781, // Chicago (example)
      lng: -87.6298,
    },
    city: "Chicago",
    region: "IL",
    type: "router",
  },
  {
    id: "router2",
    name: "Router2",
    ip: "1.1.2.1",
    location: {
      lat: 39.9526, // Philadelphia (example)
      lng: -75.1652,
    },
    city: "Philadelphia",
    region: "PA",
    type: "router",
  },
];

// Default connections configuration if not provided in env
const DEFAULT_CONNECTIONS: NetworkConnectionConfig[] = [
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
];

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

// Default thresholds
const DEFAULT_THRESHOLDS: StatusThresholds = {
  latency: {
    degraded: 50, // ms
    critical: 100, // ms
  },
  packetLoss: {
    degraded: 1, // %
    critical: 5, // %
  },
  uptime: {
    degraded: 99, // %
    critical: 95, // %
  },
};

// Export the complete configuration
export const API_CONFIG = {
  // Base URLs for the Whiskey servers
  ENDPOINTS: {
    WHISKEY1_API: import.meta.env.VITE_WHISKEY1_API || "http://10.10.4.161:31800",
    WHISKEY2_API: import.meta.env.VITE_WHISKEY2_API || "http://10.10.4.162:31800",
  },
  
  // Network topology
  TOPOLOGY: {
    // Network nodes (servers, routers, etc.)
    NODES: parseEnvArray<NetworkNodeConfig>(
      import.meta.env.VITE_NETWORK_NODES as string | undefined, 
      DEFAULT_NODES
    ),
    
    // Network connections between nodes
    CONNECTIONS: parseEnvArray<NetworkConnectionConfig>(
      import.meta.env.VITE_NETWORK_CONNECTIONS as string | undefined,
      DEFAULT_CONNECTIONS
    ),
    
    // Status thresholds for determining node health
    THRESHOLDS: JSON.parse(
      import.meta.env.VITE_STATUS_THRESHOLDS as string || 
      JSON.stringify(DEFAULT_THRESHOLDS)
    ) as StatusThresholds,
  },
  
  // Feature flags
  FEATURES: {
    // Whether to enable network test functionality
    ENABLE_NETWORK_TEST: import.meta.env.VITE_ENABLE_NETWORK_TEST === "true" || true,
    // Whether to show real error states or fall back to mock data on API failure
    SHOW_REAL_ERRORS: import.meta.env.VITE_SHOW_REAL_ERRORS === "true" || true,
  },
  
  // Timeouts
  TIMEOUTS: {
    // Default timeout for API requests in milliseconds
    DEFAULT: import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT as string) : 10000,
    // Longer timeout for network test
    NETWORK_TEST: import.meta.env.VITE_NETWORK_TEST_TIMEOUT ? 
      parseInt(import.meta.env.VITE_NETWORK_TEST_TIMEOUT as string) : 20000,
  }
};

// Helper function to check if we're running in a development environment
export const isDev = (): boolean => {
  return import.meta.env.DEV === true;
};

// Helper function to log API configuration in development
export const logApiConfig = (): void => {
  if (isDev()) {
    console.log('API Configuration:', API_CONFIG);
  }
}; 