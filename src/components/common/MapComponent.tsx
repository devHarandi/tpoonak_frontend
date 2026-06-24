import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';

// لود دینامیک کامپوننت‌های react-leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// تنظیم آیکون پیش‌فرض برای مارکر
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface MapComponentProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
}

export default function MapComponent({ onLocationSelect }: MapComponentProps) {
  const [position, setPosition] = useState<[number, number]>([35.6997, 51.3376]); // میدان آزادی تهران
  const [hasTriedGeolocation, setHasTriedGeolocation] = useState<boolean>(false);

  // تابع برای دریافت آدرس از Nominatim
  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=fa`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your-contact@example.com)', // جایگزین با اطلاعات واقعی
          },
        }
      );
      const data = await response.json();
      if (data && data.address) {
        const { city, town, road, suburb, neighbourhood } = data.address;
        const addressParts = [
          city || town || '',
          neighbourhood || '',
          road || '',
          
        ].filter(Boolean);
        return addressParts.length > 0 ? addressParts.join('، ') : undefined;
      }
      return undefined;
    } catch (err) {
      console.warn('خطا در دریافت آدرس از Nominatim:', err);
      return undefined;
    }
  };

  // دریافت لوکیشن فعلی
  useEffect(() => {
    if (!hasTriedGeolocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          // const address = await fetchAddress(latitude, longitude);
          onLocationSelect({ latitude, longitude });
          setHasTriedGeolocation(true);
        },
        async (err) => {
          console.warn('خطا در دریافت لوکیشن:', err.message);
          setPosition([35.6997, 51.3376]);
          onLocationSelect({ latitude: 35.6997, longitude: 51.3376 });
          setHasTriedGeolocation(true);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    } else if (!hasTriedGeolocation) {
      console.warn('Geolocation پشتیبانی نمی‌شود');
      setPosition([35.6997, 51.3376]);
      onLocationSelect({ latitude: 35.6997, longitude: 51.3376 });
      setHasTriedGeolocation(true);
    }
  }, [onLocationSelect, hasTriedGeolocation]);

  // مدیریت کلیک روی نقشه
  const MapEvents = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        // const address = await fetchAddress(lat, lng);
        onLocationSelect({ latitude: lat, longitude: lng });
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '200px', width: '100%' ,marginTop:"10px"}}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* نمایش موقعیت فعلی کاربر */}
      <Marker position={position}>
        <Popup>موقعیت فعلی شما</Popup>
      </Marker>
      <MapEvents />
    </MapContainer>
  );
}
