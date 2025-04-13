
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's icon issues
// This is needed because Leaflet's default icon paths are based on the page location
// and React's build process handles assets differently
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default L;
