export interface OneMapGeocodeResult {
  SEARCHVAL: string;
  BLK_NO: string;
  ROAD_NAME: string;
  BUILDING: string;
  ADDRESS: string;
  POSTAL: string;
  X: string;
  Y: string;
  LATITUDE: string;
  LONGITUDE: string;
}

export interface OneMapSearchResponse {
  found: number;
  totalNumPages: number;
  pageNum: number;
  results: OneMapGeocodeResult[];
  error?: string;
}

export interface OneMapRouteResponse {
  status_message?: string;
  route_geometry?: string;
  route_instructions?: string[][];
  route_summary?: {
    total_distance: number; // meters
    total_time: number; // seconds
  };
}

export interface MRTStation {
  name: string;
  line: string;
  lat: number;
  lng: number;
}

export const KEY_MRT_STATIONS: MRTStation[] = [
  { name: 'Tampines MRT (EW2/DT32)', line: 'East-West / Downtown', lat: 1.3533, lng: 103.9452 },
  { name: 'Raffles Place MRT (NS26/EW14)', line: 'North-South / East-West', lat: 1.2830, lng: 103.8513 },
  { name: 'City Hall MRT (NS25/EW13)', line: 'North-South / East-West', lat: 1.2931, lng: 103.8525 },
  { name: 'Dhoby Ghaut MRT (NS24/NE6/CC1)', line: 'Triple Interchange', lat: 1.2987, lng: 103.8460 },
  { name: 'Jurong East MRT (NS1/EW24)', line: 'North-South / East-West', lat: 1.3331, lng: 103.7423 },
  { name: 'Bishan MRT (NS17/CC15)', line: 'North-South / Circle', lat: 1.3508, lng: 103.8481 },
  { name: 'Paya Lebar MRT (EW8/CC9)', line: 'East-West / Circle', lat: 1.3182, lng: 103.8931 },
  { name: 'Outram Park MRT (EW16/NE3/TE17)', line: 'Triple Interchange', lat: 1.2803, lng: 103.8395 },
  { name: 'Tanjong Pagar MRT (EW15)', line: 'East-West Line', lat: 1.2764, lng: 103.8458 },
  { name: 'Tiong Bahru MRT (EW17)', line: 'East-West Line', lat: 1.2865, lng: 103.8270 },
  { name: 'Redhill MRT (EW18)', line: 'East-West Line', lat: 1.2896, lng: 103.8168 },
  { name: 'Queenstown MRT (EW19)', line: 'East-West Line', lat: 1.2944, lng: 103.8061 },
  { name: 'Buona Vista MRT (EW21/CC22)', line: 'East-West / Circle', lat: 1.3073, lng: 103.7900 },
  { name: 'Clementi MRT (EW23)', line: 'East-West Line', lat: 1.3151, lng: 103.7651 },
  { name: 'Bedok MRT (EW5)', line: 'East-West Line', lat: 1.3240, lng: 103.9300 },
  { name: 'Pasir Ris MRT (EW1/CP1)', line: 'East-West Line', lat: 1.3730, lng: 103.9493 },
  { name: 'Punggol MRT (NE17/CP4)', line: 'North-East / Cross Island', lat: 1.4052, lng: 103.9023 },
  { name: 'Sengkang MRT (NE16)', line: 'North-East Line', lat: 1.3917, lng: 103.8955 },
  { name: 'Serangoon MRT (NE12/CC13)', line: 'North-East / Circle', lat: 1.3498, lng: 103.8736 },
  { name: 'Toa Payoh MRT (NS19)', line: 'North-South Line', lat: 1.3327, lng: 103.8476 },
  { name: 'Novena MRT (NS20)', line: 'North-South Line', lat: 1.3204, lng: 103.8438 },
  { name: 'Woodlands MRT (NS9/TE2)', line: 'North-South / Thomson-East Coast', lat: 1.4369, lng: 103.7865 },
  { name: 'Yishun MRT (NS13)', line: 'North-South Line', lat: 1.4294, lng: 103.8350 },
  { name: 'Ang Mo Kio MRT (NS16/CR11)', line: 'North-South Line', lat: 1.3699, lng: 103.8496 }
];

const ONEMAP_STORAGE_KEY = 'sg_onemap_auth_token';
const ONEMAP_EXPIRY_KEY = 'sg_onemap_auth_expiry';

// In-memory geocode cache
const geocodeCache = new Map<string, OneMapGeocodeResult>();

export function getStoredOneMapToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(ONEMAP_STORAGE_KEY);
  const expiry = localStorage.getItem(ONEMAP_EXPIRY_KEY);
  if (!token) return null;
  if (expiry && Number(expiry) < Date.now()) {
    localStorage.removeItem(ONEMAP_STORAGE_KEY);
    localStorage.removeItem(ONEMAP_EXPIRY_KEY);
    return null;
  }
  return token;
}

export function saveOneMapToken(token: string, expiresInDays = 3): void {
  if (typeof window === 'undefined') return;
  const expiry = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  localStorage.setItem(ONEMAP_STORAGE_KEY, token);
  localStorage.setItem(ONEMAP_EXPIRY_KEY, String(expiry));
}

export function clearOneMapToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ONEMAP_STORAGE_KEY);
  localStorage.removeItem(ONEMAP_EXPIRY_KEY);
}

/**
 * Mint a token via POST to https://www.onemap.gov.sg/api/auth/post/getToken
 * JSON body: { email: string, password: string }
 * Lasts 3 days
 */
export async function mintOneMapToken(email: string, password: string): Promise<{ token: string; expiryTimestamp: number }> {
  const res = await fetch('https://www.onemap.gov.sg/api/auth/post/getToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Failed to authenticate with OneMap');
  }

  const token = data.access_token || data.token;
  if (!token) {
    throw new Error('No access_token returned by OneMap');
  }

  saveOneMapToken(token, 3);
  return {
    token,
    expiryTimestamp: Date.now() + 3 * 24 * 60 * 60 * 1000
  };
}

/**
 * Geocode / Search using OneMap Elastic Search API
 * https://www.onemap.gov.sg/api/common/elastic/search?searchVal=...&returnGeom=Y&getAddrDetails=Y&pageNum=1
 */
export async function searchOneMapAddress(searchVal: string): Promise<OneMapGeocodeResult | null> {
  const clean = searchVal.trim();
  if (!clean) return null;

  if (geocodeCache.has(clean)) {
    return geocodeCache.get(clean)!;
  }

  const url = new URL('https://www.onemap.gov.sg/api/common/elastic/search');
  url.searchParams.set('searchVal', clean);
  url.searchParams.set('returnGeom', 'Y');
  url.searchParams.set('getAddrDetails', 'Y');
  url.searchParams.set('pageNum', '1');

  const headers: HeadersInit = {};
  const token = getStoredOneMapToken();
  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  try {
    const res = await fetch(url.toString(), { headers });
    const json: OneMapSearchResponse = await res.json();
    if (json.results && json.results.length > 0) {
      const top = json.results[0];
      geocodeCache.set(clean, top);
      return top;
    }
  } catch (err) {
    console.warn(`OneMap geocoding error for "${searchVal}":`, err);
  }
  return null;
}

/**
 * Haversine formula to compute distance between two coordinates in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Find nearest MRT station from coordinates
 */
export function findNearestMRT(lat: number, lng: number): {
  station: MRTStation;
  distanceMeters: number;
  walkingMinutes: number;
} {
  let nearest = KEY_MRT_STATIONS[0];
  let minDistance = Infinity;

  for (const st of KEY_MRT_STATIONS) {
    const d = calculateHaversineDistance(lat, lng, st.lat, st.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = st;
    }
  }

  // Assuming average urban pedestrian speed of ~1.2 m/s (~4.3 km/h) with street circuity factor 1.25
  const streetDistance = Math.round(minDistance * 1.25);
  const walkingMinutes = Math.max(1, Math.round(streetDistance / 75));

  return {
    station: nearest,
    distanceMeters: streetDistance,
    walkingMinutes
  };
}

/**
 * OneMap Multi-modal Routing Service
 * https://www.onemap.gov.sg/api/public/routingsvc/route?start=...&end=...&routeType=walk|drive|cycle|pt
 */
export async function getOneMapRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  routeType: 'walk' | 'drive' | 'cycle' | 'pt' = 'walk'
): Promise<{
  distanceMeters: number;
  durationMinutes: number;
  source: 'onemap_api' | 'estimated';
  geometry?: string;
}> {
  const token = getStoredOneMapToken();
  if (!token) {
    const d = calculateHaversineDistance(startLat, startLng, endLat, endLng) * 1.25;
    let speedMps = 1.25; // walk
    if (routeType === 'drive') speedMps = 10;
    if (routeType === 'cycle') speedMps = 4.2;
    if (routeType === 'pt') speedMps = 6.5;

    return {
      distanceMeters: Math.round(d),
      durationMinutes: Math.max(1, Math.round(d / (speedMps * 60))),
      source: 'estimated'
    };
  }

  try {
    const url = new URL('https://www.onemap.gov.sg/api/public/routingsvc/route');
    url.searchParams.set('start', `${startLat},${startLng}`);
    url.searchParams.set('end', `${endLat},${endLng}`);
    url.searchParams.set('routeType', routeType);

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data: OneMapRouteResponse = await res.json();
      if (data.route_summary) {
        return {
          distanceMeters: Math.round(data.route_summary.total_distance),
          durationMinutes: Math.max(1, Math.round(data.route_summary.total_time / 60)),
          geometry: data.route_geometry,
          source: 'onemap_api'
        };
      }
    }
  } catch (err) {
    console.warn('OneMap routing API call failed, falling back to estimation:', err);
  }

  const d = calculateHaversineDistance(startLat, startLng, endLat, endLng) * 1.25;
  return {
    distanceMeters: Math.round(d),
    durationMinutes: Math.max(1, Math.round(d / (1.25 * 60))),
    source: 'estimated'
  };
}
