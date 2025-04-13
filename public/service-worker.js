// Cache name for map tiles
const TILE_CACHE_NAME = 'atlas-map-tiles-v1';
const STATIC_CACHE_NAME = 'atlas-static-v1';

// United States bounds
const US_BOUNDS = {
  north: 49.5, // Northern US border
  south: 24.5, // Southern US border (including Florida Keys)
  east: -66.0, // Eastern US border
  west: -125.0, // Western US border
};

// List of static assets to cache immediately on install
const staticAssets = [
  '/',
  '/index.html',
  '/favicon.ico'
];

// Convert lat/lon to tile coordinates
function lon2tile(lon, zoom) {
  return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
}

function lat2tile(lat, zoom) {
  return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
}

// Generate US tile URLs for specific zoom levels
function generateUSTileUrls() {
  const tileUrls = [];
  // Only pre-cache zoom levels 3-8 to keep size reasonable while covering the US
  const minZoom = 3;
  const maxZoom = 8;
  
  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    // Convert bounds to tile coordinates
    const northTile = lat2tile(US_BOUNDS.north, zoom);
    const southTile = lat2tile(US_BOUNDS.south, zoom);
    const eastTile = lon2tile(US_BOUNDS.east, zoom);
    const westTile = lon2tile(US_BOUNDS.west, zoom);
    
    // Calculate the tile ranges
    const yStart = Math.min(northTile, southTile);
    const yEnd = Math.max(northTile, southTile);
    const xStart = Math.min(westTile, eastTile);
    const xEnd = Math.max(westTile, eastTile);
    
    // For each tile in the range
    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
        // Add URLs for all three subdomains
        ['a', 'b', 'c'].forEach(subdomain => {
          tileUrls.push(`https://${subdomain}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`);
        });
      }
    }
  }
  
  return tileUrls;
}

// Pre-cache tiles in batches to avoid memory issues
async function preCacheTiles() {
  const usTiles = generateUSTileUrls();
  const cache = await caches.open(TILE_CACHE_NAME);
  
  // Process tiles in batches
  const batchSize = 20;
  for (let i = 0; i < usTiles.length; i += batchSize) {
    const batch = usTiles.slice(i, i + batchSize);
    await Promise.all(batch.map(async url => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error(`Failed to cache tile: ${url}`, error);
      }
    }));
    
    // Allow some time for UI thread between batches
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`Pre-cached ${usTiles.length} US map tiles`);
  return usTiles.length;
}

// Install event - cache static assets and US map tiles
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Cache static assets first
    const staticCache = await caches.open(STATIC_CACHE_NAME);
    await staticCache.addAll(staticAssets);
    
    // Then pre-cache all US tiles
    await preCacheTiles();
    
    // Skip waiting to activate immediately
    await self.skipWaiting();
  })());
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  const currentCaches = [TILE_CACHE_NAME, STATIC_CACHE_NAME];
  event.waitUntil((async () => {
    // Delete old caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => !currentCaches.includes(name))
        .map(name => caches.delete(name))
    );
    
    // Claim all clients so service worker works immediately
    await self.clients.claim();
  })());
});

// Fetch event - always serve from cache first, never try network for tiles
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Handle map tile requests - cache-only strategy
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith((async () => {
      // Always try to get from cache first
      const cache = await caches.open(TILE_CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, return a placeholder tile rather than fetching
      // You could replace this with a custom local tile image for better UX
      return new Response('Tile not available offline', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    })());
    return;
  }
  
  // For other requests, try cache first, but fall back to network
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

// Custom event to pre-download tiles for a specific area
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_TILES') {
    const { tiles } = event.data;
    if (tiles && Array.isArray(tiles)) {
      event.waitUntil(cacheTiles(tiles));
    }
  }
});

// Function to cache a list of tile URLs
async function cacheTiles(tileUrls) {
  const cache = await caches.open(TILE_CACHE_NAME);
  
  // Create a client to report progress
  const client = await self.clients.get(event.clientId);
  let completed = 0;
  
  // Process tiles in batches to avoid overwhelming the network
  const batchSize = 10;
  for (let i = 0; i < tileUrls.length; i += batchSize) {
    const batch = tileUrls.slice(i, i + batchSize);
    await Promise.all(batch.map(async url => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error(`Failed to cache tile: ${url}`, error);
      }
      
      completed++;
      if (client) {
        client.postMessage({
          type: 'CACHE_PROGRESS',
          completed,
          total: tileUrls.length
        });
      }
    }));
  }
  
  if (client) {
    client.postMessage({
      type: 'CACHE_COMPLETE',
      total: tileUrls.length
    });
  }
} 