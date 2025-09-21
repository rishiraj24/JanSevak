import React, { useEffect, useRef } from "react";
import { FeatureCollection, Point } from "geojson";
import mapboxgl from "mapbox-gl";
import "./mapboxMap.css";
import { Location } from "../../services/api";

mapboxgl.accessToken =
  "pk.eyJ1IjoicmlzaGlyYWoyNCIsImEiOiJjbWZtYjR3NTgwMDI1MmlzajlnNW91ZXV6In0.LjVwmnBHR7Y7DFBMBbI-aQ";

interface MapProps {
  locations: Location[];
  onMarkerClick?: (location: Location) => void;
}

const MapboxMap: React.FC<MapProps> = ({ locations, onMarkerClick }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [77.209, 28.6139],
      zoom: 10,
      maxBounds: [
        [76.8, 28.4],
        [77.6, 28.9],
      ],
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on("load", () => {
      // Prepare GeoJSON data with all complaint details
      const geojson: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: locations.map((loc) => ({
          type: "Feature",
          properties: {
            title: loc.name,
            description: loc.info,
            report_id: loc.report_id,
            category: loc.category,
            priority: loc.priority,
            department: loc.department,
            status: loc.status,
            full_description: loc.description,
            created_at: loc.created_at,
            phone_number: loc.phone_number,
            resolution_days: loc.resolution_days,
          },
          geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
        })),
      };

      // Add source
      map.current!.addSource("locations", {
        type: "geojson",
        data: geojson,
      });

      // Add layer with icon
      map.current!.loadImage(
        "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
        (error, image) => {
          if (error) throw error;

          if (!map.current!.hasImage("custom-marker")) {
            map.current!.addImage("custom-marker", image!);
          }

          map.current!.addLayer({
            id: "locations-layer",
            type: "symbol",
            source: "locations",
            layout: {
              "icon-image": "custom-marker",
              "icon-size": 0.5,
              "icon-anchor": "bottom",
              "text-field": ["get", "title"],
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-offset": [0, 1.2],
              "text-anchor": "top",
            },
          });

          // Add click event for side popup
          map.current!.on("click", "locations-layer", (e) => {
            if (onMarkerClick && e.features && e.features.length > 0) {
              const properties = e.features[0].properties!;
              const coordinates = (e.features[0].geometry as any).coordinates;

              // Find the corresponding location object
              const clickedLocation = locations.find(
                (loc) => loc.report_id === properties.report_id
              );

              if (clickedLocation) {
                onMarkerClick(clickedLocation);
              }
            }
          });

          // Change the cursor to a pointer when the mouse is over the locations layer.
          map.current!.on("mouseenter", "locations-layer", () => {
            map.current!.getCanvas().style.cursor = "pointer";
          });

          // Change it back to a pointer when it leaves.
          map.current!.on("mouseleave", "locations-layer", () => {
            map.current!.getCanvas().style.cursor = "";
          });
        }
      );
    });

    return () => map.current?.remove();
  }, [locations]);

  return <div ref={mapContainer} className="map-container" />;
};

export default MapboxMap;
