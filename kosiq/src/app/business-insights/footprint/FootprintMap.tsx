'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

interface Location {
  name: string;
  address: string;
  type: string;
  patients: number;
  lat: number;
  lng: number;
  demographics: {
    population: string;
    medicare: string;
    medicaid: string;
    seniorPct: string;
    latinoPct: string;
    medianAge: string;
    medianIncome: string;
    topConditions: string[];
    avgRiskScore: number;
    pmpm: string;
  };
}

interface Props {
  locations: Location[];
  typeColors: Record<string, string>;
  onSelect: (location: Location) => void;
  selected: Location | null;
}

function createMarkerIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 16 : 12;
  const border = isSelected ? 3 : 2;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:${border}px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);${isSelected ? 'transform:scale(1.2);' : ''}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FlyToSelected({ selected }: { selected: Location | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 14, { duration: 0.8 });
    }
  }, [selected, map]);
  return null;
}

export default function FootprintMap({ locations, typeColors, onSelect, selected }: Props) {
  const center: [number, number] = [25.78, -80.22];

  return (
    <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }} zoomControl={true}>
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FlyToSelected selected={selected} />
      {locations.map((loc, i) => (
        <Marker
          key={i}
          position={[loc.lat, loc.lng]}
          icon={createMarkerIcon(typeColors[loc.type] || '#0071e3', selected?.name === loc.name)}
          eventHandlers={{ click: () => onSelect(loc) }}
        >
          <Popup>
            <div style={{ minWidth: 200, fontFamily: 'Inter, -apple-system, sans-serif' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: '#1d1d1f' }}>{loc.name}</div>
              <div style={{ fontSize: 11, color: '#86868b', marginBottom: 8 }}>{loc.address}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div style={{ background: '#f5f5f7', borderRadius: 8, padding: '6px 8px' }}>
                  <div style={{ fontSize: 9, color: '#86868b' }}>Patients</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{loc.patients}</div>
                </div>
                <div style={{ background: '#f5f5f7', borderRadius: 8, padding: '6px 8px' }}>
                  <div style={{ fontSize: 9, color: '#86868b' }}>Risk Score</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: loc.demographics.avgRiskScore >= 70 ? '#dc2626' : loc.demographics.avgRiskScore >= 50 ? '#ea580c' : '#16a34a' }}>{loc.demographics.avgRiskScore}</div>
                </div>
                <div style={{ background: '#f5f5f7', borderRadius: 8, padding: '6px 8px' }}>
                  <div style={{ fontSize: 9, color: '#86868b' }}>PMPM</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{loc.demographics.pmpm}</div>
                </div>
                <div style={{ background: '#f5f5f7', borderRadius: 8, padding: '6px 8px' }}>
                  <div style={{ fontSize: 9, color: '#86868b' }}>Medicare</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{loc.demographics.medicare}</div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: '#0071e3', cursor: 'pointer', fontWeight: 500 }}>Click marker for full details</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
