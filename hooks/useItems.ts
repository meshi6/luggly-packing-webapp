'use client';

import { useCallback } from 'react';
import { Item, BagConfig } from '@/lib/types';

export function useItems(trip: BagConfig | undefined, onUpdate: (trip: Partial<BagConfig>) => void) {
  const addItem = useCallback(
    (item: Omit<Item, 'id' | 'packed'>) => {
      if (!trip) return;
      const newItem: Item = {
        ...item,
        id: Date.now().toString(),
        packed: false,
      };
      onUpdate({
        items: [...trip.items, newItem],
      });
    },
    [trip, onUpdate]
  );

  const updateItem = useCallback(
    (itemId: string, updates: Partial<Item>) => {
      if (!trip) return;
      onUpdate({
        items: trip.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      });
    },
    [trip, onUpdate]
  );

  const deleteItem = useCallback(
    (itemId: string) => {
      if (!trip) return;
      onUpdate({
        items: trip.items.filter(item => item.id !== itemId),
      });
    },
    [trip, onUpdate]
  );

  const moveItemToBag = useCallback(
    (itemId: string, bagId: string | undefined) => {
      if (!trip) return;
      updateItem(itemId, { bagId });
    },
    [updateItem]
  );

  const toggleItemPacked = useCallback(
    (itemId: string) => {
      if (!trip) return;
      const item = trip.items.find(i => i.id === itemId);
      if (item) {
        updateItem(itemId, { packed: !item.packed });
      }
    },
    [trip, updateItem]
  );

  const getBagItems = useCallback(
    (bagId?: string) => {
      if (!trip) return [];
      return trip.items.filter(item => item.bagId === bagId);
    },
    [trip]
  );

  const getBagWeight = useCallback(
    (bagId: string) => {
      if (!trip) return 0;
      return trip.items
        .filter(item => item.bagId === bagId)
        .reduce((sum, item) => sum + item.weight, 0);
    },
    [trip]
  );

  const getTotalWeight = useCallback(() => {
    if (!trip) return 0;
    return trip.items.reduce((sum, item) => sum + item.weight, 0);
  }, [trip]);

  const getPackedCount = useCallback(() => {
    if (!trip) return 0;
    return trip.items.filter(item => item.packed).length;
  }, [trip]);

  return {
    addItem,
    updateItem,
    deleteItem,
    moveItemToBag,
    toggleItemPacked,
    getBagItems,
    getBagWeight,
    getTotalWeight,
    getPackedCount,
  };
}
