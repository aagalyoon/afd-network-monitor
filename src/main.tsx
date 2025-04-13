import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/leaflet-setup';

// No service worker needed - using local tiles

createRoot(document.getElementById("root")!).render(<App />);
