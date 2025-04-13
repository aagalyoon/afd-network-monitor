## Overview

This document explains how to integrate your network APIs with the application.

## API Integration Requirements

### API Endpoints Configuration

The application expects API endpoints in the following format:

```json
[
  {
    "id": "your-node-id",
    "name": "Your Node Name",
    "url": "http://your-api-url",
    "nodeId": "corresponding-network-node-id"
  }
]
```

These can be provided in the `.env` file using the `VITE_API_ENDPOINTS` variable.

### Required API Routes

Each API endpoint should implement the following routes:

| Route | Purpose |
|-------|---------|
| `/topology` | Provides network topology information |
| `/health` | Reports node health status |
| `/ping` | Handles ping functionality between nodes |
| `/traceroute` | Provides traceroute capability between nodes |
| `/network_test` | Offers network testing functionality |

### Network Nodes Format

Network nodes should follow this structure:

```json
{
  "id": "unique-id",
  "name": "Node Name",
  "ip": "external-ip",
  "internalIp": "internal-ip",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "city": "City Name",
  "region": "Region",
  "type": "server|router|switch|gateway"
}
```

### Network Connections Format

Connections between nodes should be defined as:

```json
{
  "id": "connection-id",
  "source": "source-node-id",
  "target": "target-node-id",
  "bandwidth": 1000
}
```

## Configuration Options

There are two ways to configure the application to work with your APIs:

1. **Environment Variables**: Update the `.env` file with your API details:
   ```
   VITE_API_ENDPOINTS=[{"id":"node1","name":"Node 1","url":"http://api1.example.com","nodeId":"node1"}]
   VITE_NETWORK_NODES=[{"id":"node1","name":"Node 1","ip":"192.168.1.1","type":"server",...}]
   VITE_NETWORK_CONNECTIONS=[{"id":"conn1","source":"node1","target":"node2","bandwidth":1000}]
   ```

2. **Development Defaults**: For development purposes, you can modify the `DEV_DEFAULTS` in `src/config/api-config.ts`.

## Status Thresholds

The application uses thresholds to determine the health status of nodes and connections:

```json
{
  "latency": {
    "degraded": 50,
    "critical": 100
  },
  "packetLoss": {
    "degraded": 1,
    "critical": 5
  },
  "uptime": {
    "degraded": 99,
    "critical": 95
  }
}
```

You can customize these thresholds in the `.env` file or by modifying the code.

## Complete Environment Configuration Example

See the `.env.example` file for a complete example of all available configuration options.

## Running the Application

After configuration:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
``` 