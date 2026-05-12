"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import type { Restaurant } from "@/lib/types";

type MappedRestaurant = Restaurant & {
  latitude: number;
  longitude: number;
};

function getMappedRestaurants(restaurants: Restaurant[]): MappedRestaurant[] {
  return restaurants.filter(
    (restaurant): restaurant is MappedRestaurant =>
      restaurant.latitude !== null && restaurant.longitude !== null,
  );
}

function getCenter(restaurants: MappedRestaurant[]): [number, number] {
  if (restaurants.length > 0) {
    const totals = restaurants.reduce(
      (sum, restaurant) => ({
        latitude: sum.latitude + restaurant.latitude,
        longitude: sum.longitude + restaurant.longitude,
      }),
      { latitude: 0, longitude: 0 },
    );

    return [
      totals.latitude / restaurants.length,
      totals.longitude / restaurants.length,
    ];
  }

  return [
    Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT ?? 29.9012),
    Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG ?? -81.3124),
  ];
}

export function RestaurantMap({ restaurants }: { restaurants: Restaurant[] }) {
  const mappedRestaurants = getMappedRestaurants(restaurants);
  const center = getCenter(mappedRestaurants);

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mappedRestaurants.map((restaurant) => (
        <CircleMarker
          key={restaurant.id}
          center={[restaurant.latitude, restaurant.longitude]}
          pathOptions={{
            color: "#ea580c",
            fillColor: "#fb923c",
            fillOpacity: 0.85,
          }}
          radius={10}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{restaurant.name}</p>
              <p>{restaurant.address}</p>
              <a href={restaurant.website} target="_blank" rel="noreferrer">
                Website
              </a>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
