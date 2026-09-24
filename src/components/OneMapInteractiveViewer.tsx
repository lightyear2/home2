import React from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Train, Layers, Compass, ZoomIn, ZoomOut, Eye, Sparkles } from 'lucide-react';
import { HDBTransaction } from '../types/hdb';
import { searchOneMapAddress, KEY_MRT_STATIONS, findNearestMRT, OneMapGeocodeResult } from '../services/onemapApi';

interface OneMapInteractiveViewerProps {
  transactions: HDBTransaction[];
  onSelectTransaction: (tx: HDBTransaction) => void;
  activeTownFilter?: string;
  onOpenTokenModal: () => void;
}

type TileStyle = 'Night' | 'Default' | 'Grey' | 'Original';

export const OneMapInteractiveViewer: React.FC<OneMapInteractiveViewerProps> = ({
  transactions,
  onSelectTransaction,
  activeTownFilter,
  onOpenTokenModal
}) => {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const tileLayerRef = React.useRef<L.TileLayer | null>(null);
  const markerGroupRef = React.useRef<L.LayerGroup | null>(null);
  const mrtGroupRef = React.useRef<L.LayerGroup | null>(null);

  const [tileStyle, setTileStyle] = React.useState<TileStyle>('Night');
  const [showMrt, setShowMrt] = React.useState(true);
  const [geocodedCount, setGeocodedCount] = React.useState(0);
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  const [selectedFlat, setSelectedFlat] = React.useState<{ tx: HDBTransaction; geo: OneMapGeocodeResult } | null>(null);

  // Initialize Map
  React.useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198], // Singapore central center
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false
    });

    const tileUrl = `https://www.onemap.gov.sg/maps/tiles/${tileStyle}/{z}/{x}/{y}.png`;
    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '<a href="https://www.onemap.gov.sg/" target="_blank">OneMap</a> &copy; Singapore Land Authority',
      maxZoom: 18
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    const mrtGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    markerGroupRef.current = markerGroup;
    mrtGroupRef.current = mrtGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile style when selected
  React.useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const newUrl = `https://www.onemap.gov.sg/maps/tiles/${tileStyle}/{z}/{x}/{y}.png`;
    tileLayerRef.current.setUrl(newUrl);
  }, [tileStyle]);

  // Render MRT stations
  React.useEffect(() => {
    if (!mrtGroupRef.current) return;
    mrtGroupRef.current.clearLayers();

    if (showMrt) {
      KEY_MRT_STATIONS.forEach(st => {
        const icon = L.divIcon({
          className: 'custom-mrt-pin',
          html: `<div style="background-color: #0f172a; border: 1.5px solid #38bdf8; border-radius: 6px; padding: 2px 5px; color: #38bdf8; font-size: 9px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 3px;">
            <span style="display:inline-block; width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;"></span>
            ${st.name.split(' ')[0]}
          </div>`,
          iconSize: [60, 20],
          iconAnchor: [30, 10]
        });

        const marker = L.marker([st.lat, st.lng], { icon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 4px;">
            <strong style="color: #0284c7;">${st.name}</strong>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Lines: ${st.line}</div>
          </div>
        `);
        mrtGroupRef.current?.addLayer(marker);
      });
    }
  }, [showMrt]);

  // Geocode and plot transactions on the map
  React.useEffect(() => {
    let isCancelled = false;
    if (!markerGroupRef.current || !mapInstanceRef.current) return;

    markerGroupRef.current.clearLayers();
    setGeocodedCount(0);

    const plotMarkers = async () => {
      setIsGeocoding(true);
      const toPlot = transactions.slice(0, 30); // Plot up to top 30 current records
      const coords: [number, number][] = [];
      let count = 0;

      for (const tx of toPlot) {
        if (isCancelled) break;
        const query = `${tx.block} ${tx.streetName}`;
        const geo = await searchOneMapAddress(query);

        if (geo && geo.LATITUDE && geo.LONGITUDE && !isCancelled) {
          const lat = parseFloat(geo.LATITUDE);
          const lng = parseFloat(geo.LONGITUDE);
          coords.push([lat, lng]);
          count++;
          setGeocodedCount(count);

          const nearest = findNearestMRT(lat, lng);

          // Color by price tier
          let badgeBg = '#10b981'; // Green <500k
          let textColor = '#ffffff';
          if (tx.resalePrice >= 1000000) {
            badgeBg = '#f43f5e'; // Rose >=1M
          } else if (tx.resalePrice >= 800000) {
            badgeBg = '#f59e0b'; // Amber 800k-1M
          } else if (tx.resalePrice >= 500000) {
            badgeBg = '#0ea5e9'; // Sky 500k-800k
          }

          const priceFormatted = tx.resalePrice >= 1000000
            ? `$${(tx.resalePrice / 1000000).toFixed(2)}M`
            : `$${Math.round(tx.resalePrice / 1000)}k`;

          const pinIcon = L.divIcon({
            className: 'custom-hdb-pin',
            html: `<div style="background-color: ${badgeBg}; color: ${textColor}; padding: 3px 6px; border-radius: 9999px; font-size: 10px; font-weight: 800; font-family: monospace; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.6); border: 1.5px solid rgba(255,255,255,0.85); transform: translateY(-50%); cursor: pointer;">
              ${priceFormatted}
            </div>`,
            iconSize: [40, 20],
            iconAnchor: [20, 10]
          });

          const marker = L.marker([lat, lng], { icon: pinIcon });
          marker.on('click', () => {
            setSelectedFlat({ tx, geo });
          });

          marker.bindTooltip(`
            <div style="font-size: 11px; font-family: inherit;">
              <strong>${tx.address}</strong><br/>
              ${tx.flatType} · $${tx.resalePrice.toLocaleString()} ($${tx.pricePerSqft} psf)<br/>
              <span style="color:#0284c7;">~${nearest.walkingMinutes} min walk to ${nearest.station.name.split(' ')[0]} MRT</span>
            </div>
          `);

          markerGroupRef.current?.addLayer(marker);
        }
      }

      // If we plotted coordinates, fit bounds
      if (coords.length > 0 && mapInstanceRef.current && !isCancelled) {
        const bounds = L.latLngBounds(coords);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }

      if (!isCancelled) setIsGeocoding(false);
    };

    plotMarkers();

    return () => {
      isCancelled = true;
    };
  }, [transactions]);

  // Jump to specific town
  const handleJumpTown = (lat: number, lng: number, zoom = 14) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Singapore OneMap SLA Layer</span>
          </div>

          <span className="text-slate-500">|</span>

          <span className="text-slate-300">
            Plotted <strong className="text-white font-mono">{geocodedCount}</strong> flats from active search
            {isGeocoding && <span className="text-rose-400 ml-1.5 animate-pulse">(Geocoding via OneMap...)</span>}
          </span>
        </div>

        {/* Map Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tile Layer Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['Night', 'Default', 'Grey', 'Original'] as TileStyle[]).map(style => (
              <button
                key={style}
                onClick={() => setTileStyle(style)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  tileStyle === style
                    ? 'bg-slate-800 text-rose-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Toggle MRT */}
          <button
            onClick={() => setShowMrt(!showMrt)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showMrt
                ? 'bg-sky-950/60 border-sky-800/80 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>MRT Overlays</span>
          </button>

          {/* OneMap Token Config */}
          <button
            onClick={onOpenTokenModal}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-medium transition-colors"
          >
            OneMap API Token
          </button>
        </div>
      </div>

      {/* Map Viewport Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl h-[580px] w-full">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Quick Town Hubs */}
        <div className="absolute top-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2 rounded-xl flex items-center gap-1.5 shadow-lg text-xs">
          <span className="text-slate-400 text-[11px] px-1 font-medium">Quick Fly:</span>
          <button
            onClick={() => handleJumpTown(1.3533, 103.9452)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded transition-colors"
          >
            Tampines
          </button>
          <button
            onClick={() => handleJumpTown(1.2800, 103.8400)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded transition-colors"
          >
            Central / Pinnacle
          </button>
          <button
            onClick={() => handleJumpTown(1.3508, 103.8481)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded transition-colors"
          >
            Bishan
          </button>
          <button
            onClick={() => handleJumpTown(1.4052, 103.9023)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded transition-colors"
          >
            Punggol
          </button>
          <button
            onClick={() => handleJumpTown(1.3331, 103.7423)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded transition-colors"
          >
            Jurong East
          </button>
        </div>

        {/* Floating Price Tier Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1.5">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Price Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300 font-mono text-[11px]">&ge; $1,000,000 (Trophy)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300 font-mono text-[11px]">$800k - $1M</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-slate-300 font-mono text-[11px]">$500k - $800k</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-mono text-[11px]">&lt; $500k (Value)</span>
          </div>
        </div>

        {/* Selected Flat Preview Card (Overlay) */}
        {selectedFlat && (
          <div className="absolute top-4 right-4 z-20 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl space-y-3 text-xs animate-in fade-in">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
                  {selectedFlat.geo.BUILDING || 'HDB RESIDENTIAL'}
                </span>
                <h4 className="font-bold text-sm text-white mt-0.5">
                  {selectedFlat.tx.address}
                </h4>
                <div className="text-slate-400 text-[11px]">
                  Postal: <strong className="text-slate-200 font-mono">{selectedFlat.geo.POSTAL || 'N/A'}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedFlat(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-baseline font-mono">
              <span className="text-slate-400 text-[11px]">Price:</span>
              <span className="text-base font-bold text-white tabular-nums">
                ${selectedFlat.tx.resalePrice.toLocaleString()}
              </span>
            </div>

            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>Type: <strong>{selectedFlat.tx.flatType}</strong> ({selectedFlat.tx.flatModel})</div>
              <div>Floor: <strong>{selectedFlat.tx.storeyRange} Flr</strong> · Area: <strong>{selectedFlat.tx.floorAreaSqm} sqm</strong></div>
              <div>Remaining Lease: <strong>{selectedFlat.tx.remainingLeaseYears.toFixed(1)} yrs</strong></div>
              <div className="text-sky-400 flex items-center gap-1 mt-1 pt-1 border-t border-slate-800">
                <Train className="w-3.5 h-3.5" />
                <span>
                  ~{findNearestMRT(parseFloat(selectedFlat.geo.LATITUDE), parseFloat(selectedFlat.geo.LONGITUDE)).walkingMinutes} min walk to MRT
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectTransaction(selectedFlat.tx)}
              className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Full Specifications</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
