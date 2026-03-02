'use client';

import { useState, useEffect, useCallback } from 'react';
import { BagConfig, DEFAULT_BAGS } from '@/lib/types';

const STORAGE_KEY = 'buggly_trips';

export function useTrips() {
  const [trips, setTrips] = useState<BagConfig[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load trips from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTrips(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load trips:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save trips to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    }
  }, [trips, isLoaded]);

  const createTrip = useCallback(
    (name: string, tripType: BagConfig['tripType'], tripDuration: number) => {
      const newTrip: BagConfig = {
        id: Date.now().toString(),
        name,
        bags: DEFAULT_BAGS.map(bag => ({ ...bag })),
        items: [],
        tripType,
        tripDuration,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setTrips(prev => [...prev, newTrip]);
      return newTrip;
    },
    []
  );

  const updateTrip = useCallback((tripId: string, updates: Partial<BagConfig>) => {
    setTrips(prev =>
      prev.map(trip =>
        trip.id === tripId
          ? { ...trip, ...updates, updatedAt: Date.now() }
          : trip
      )
    );
  }, []);

  const deleteTrip = useCallback((tripId: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
  }, []);

  const getTrip = useCallback(
    (tripId: string) => trips.find(trip => trip.id === tripId),
    [trips]
  );

  return {
    trips,
    isLoaded,
    createTrip,
    updateTrip,
    deleteTrip,
    getTrip,
  };
}
