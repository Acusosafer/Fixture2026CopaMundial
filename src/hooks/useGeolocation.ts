'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'mundial2026-location';

interface StoredLocation {
  lat: number;
  lng: number;
}

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
  requestPermission: () => void;
}

function readFromStorage(): StoredLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLocation;
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeToStorage(lat: number, lng: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
  } catch {
    // localStorage not available (e.g. private mode full storage)
  }
}

export function useGeolocation(): GeolocationState {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    const stored = readFromStorage();
    if (stored) {
      setLat(stored.lat);
      setLng(stored.lng);
    }
  }, []);

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está disponible en este dispositivo.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        writeToStorage(latitude, longitude);
        setLoading(false);
      },
      (positionError) => {
        const messages: Record<number, string> = {
          1: 'Permiso de ubicación denegado.',
          2: 'No se pudo determinar la ubicación.',
          3: 'La solicitud de ubicación tardó demasiado.',
        };
        setError(messages[positionError.code] ?? 'Error desconocido al obtener la ubicación.');
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60 * 60 * 1000, // accept cached position up to 1h old
      }
    );
  }, []);

  return { lat, lng, error, loading, requestPermission };
}
