import React, { useEffect, useRef } from 'react';
import { Report } from '@shared/schema';

interface MapProps {
  reports: Report[];
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number };
  height?: string;
}

export function Map({ reports, onLocationSelect, selectedLocation, height = "100%" }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const L = (window as any).L;
      if (!L || mapInstanceRef.current) return;

      // Initialize map
      const map = L.map(mapRef.current).setView([40.7128, -74.0060], 12);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add click handler for location selection
      if (onLocationSelect) {
        map.on('click', (e: any) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }

      // Add markers for reports
      reports.forEach(report => {
        const color = report.status === 'new' ? '#ef4444' : 
                    report.status === 'in_progress' ? '#f59e0b' : '#10b981';
        
        L.circleMarker([parseFloat(report.latitude), parseFloat(report.longitude)], {
          color: 'white',
          fillColor: color,
          fillOpacity: 0.8,
          radius: 8,
          weight: 2
        }).addTo(map).bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">${report.title}</h3>
            <p class="text-sm text-gray-600">${report.description || ''}</p>
            <div class="text-xs text-gray-500 mt-1">
              Status: ${report.status}
            </div>
          </div>
        `);
      });

      // Add selected location marker
      if (selectedLocation) {
        L.marker([selectedLocation.lat, selectedLocation.lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(map);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [reports, selectedLocation, onLocationSelect]);

  return (
    <div 
      ref={mapRef} 
      style={{ height }} 
      className="w-full rounded-lg"
    />
  );
}
