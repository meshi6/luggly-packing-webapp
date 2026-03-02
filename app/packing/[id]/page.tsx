'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import { ItemCard } from '@/components/ItemCard';
import { AddItemSheet } from '@/components/AddItemSheet';
import { AnimatedProgressBar } from '@/components/AnimatedProgressBar';
import { useTrips } from '@/hooks/useTrips';
import { useItems } from '@/hooks/useItems';
import { BagConfig, ITEM_CATEGORIES } from '@/lib/types';
import { SUGGESTED_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ChevronDown, ChevronUp, Sparkles, ArrowLeft } from 'lucide-react';

export default function PackingBoard() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const { trips, isLoaded, updateTrip, getTrip } = useTrips();
  const trip = getTrip(tripId);

  const itemHooks = useItems(trip, (updates) => {
    updateTrip(tripId, updates);
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormBagId, setAddFormBagId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Drag reorder state
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Clear new item highlight after animation
  useEffect(() => {
    if (newItemIds.size > 0) {
      const timer = setTimeout(() => setNewItemIds(new Set()), 500);
      return () => clearTimeout(timer);
    }
  }, [newItemIds]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Trip not found</p>
          <Button onClick={() => router.push('/')} variant="outline">Back to Home</Button>
        </div>
      </div>
    );
  }

  const handleAddItem = (item: Parameters<typeof itemHooks.addItem>[0]) => {
    const newId = Date.now().toString();
    itemHooks.addItem(item);
    // Track new item for entrance animation
    setNewItemIds(prev => new Set(prev).add(newId));
  };

  const handleSuggestionClick = (itemName: string, weight: number) => {
    handleAddItem({
      name: itemName,
      category: 'Other',
      weight,
      bagId: trip.bags[0].id,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    itemHooks.deleteItem(itemId);
  };

  const handleMoveBag = (itemId: string, currentBagId?: string) => {
    // Cycle to the next bag
    const currentIdx = trip.bags.findIndex(b => b.id === currentBagId);
    const nextBag = trip.bags[(currentIdx + 1) % trip.bags.length];
    itemHooks.moveItemToBag(itemId, nextBag.id);
  };

  // Drag reorder handlers
  const handleDragStart = (itemId: string) => {
    setDragItemId(itemId);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (dragItemId && dragItemId !== itemId) {
      setDragOverItemId(itemId);
    }
  };

  const handleDrop = (bagId: string) => {
    if (!dragItemId || !dragOverItemId || !trip) return;
    const items = [...trip.items];
    const fromIdx = items.findIndex(i => i.id === dragItemId);
    const toIdx = items.findIndex(i => i.id === dragOverItemId);
    if (fromIdx === -1 || toIdx === -1) return;

    const [moved] = items.splice(fromIdx, 1);
    moved.bagId = bagId;
    items.splice(toIdx, 0, moved);
    updateTrip(tripId, { items });

    setDragItemId(null);
    setDragOverItemId(null);
  };

  const totalWeight = itemHooks.getTotalWeight();
  const totalCapacity = trip.bags.reduce((sum, bag) => sum + bag.capacity, 0);
  const percentFull = Math.round((totalWeight / totalCapacity) * 100);
  const packedCount = itemHooks.getPackedCount();
  const totalItems = trip.items.length;
  const packPercent = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

  const suggestedItems = SUGGESTED_ITEMS[trip.tripType];

  // Sort: packed items go to the bottom
  const getSortedBagItems = (bagId: string) => {
    const items = itemHooks.getBagItems(bagId);
    return [...items].sort((a, b) => {
      if (a.packed === b.packed) return 0;
      return a.packed ? 1 : -1;
    });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row min-h-screen bg-background">
      <Navigation />

      <main className="flex-1 pb-24 md:pb-0">
        {/* Custom header with back button */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to trips"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-foreground truncate">{trip.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {trip.tripDuration} days  /  {packedCount}/{totalItems} packed  /  {packPercent}% ready
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Overall Capacity Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Weight</p>
                  <p className="text-xl font-bold text-foreground leading-tight mt-0.5">
                    {(totalWeight / 1000).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ {(totalCapacity / 1000).toFixed(1)} kg</span>
                  </p>
                </div>
                <p className={`text-2xl font-bold ${
                  percentFull > 100 ? 'text-destructive' :
                  percentFull > 80 ? 'text-orange-500' :
                  'text-primary'
                }`}>
                  {percentFull}%
                </p>
              </div>
              <AnimatedProgressBar percent={percentFull} height="h-3" />
              {percentFull > 100 && (
                <p className="text-xs text-destructive mt-2 font-medium animate-fade-in">
                  Over capacity by {((totalWeight - totalCapacity) / 1000).toFixed(1)} kg
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bags */}
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {trip.bags.map(bag => {
              const bagItems = getSortedBagItems(bag.id);
              const bagWeight = itemHooks.getBagWeight(bag.id);
              const bagPercentFull = Math.round((bagWeight / bag.capacity) * 100);

              return (
                <Card
                  key={bag.id}
                  className="h-fit"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(bag.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{bag.name}</CardTitle>
                      <span className={`text-sm font-semibold ${
                        bagPercentFull > 100 ? 'text-destructive' :
                        bagPercentFull > 80 ? 'text-orange-500' :
                        'text-primary'
                      }`}>
                        {bagPercentFull}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>{(bagWeight / 1000).toFixed(1)} / {(bag.capacity / 1000).toFixed(1)} kg</span>
                      <span>{bagItems.length} items</span>
                    </div>
                    <AnimatedProgressBar percent={bagPercentFull} height="h-2" className="mt-2" />
                  </CardHeader>

                  <CardContent className="space-y-2 pt-0">
                    {bagItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No items yet
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {bagItems.map(item => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(item.id)}
                            onDragOver={(e) => handleDragOver(e, item.id)}
                            onDragEnd={() => { setDragItemId(null); setDragOverItemId(null); }}
                            className={`cursor-grab active:cursor-grabbing ${
                              dragOverItemId === item.id ? 'border-t-2 border-primary' : ''
                            }`}
                          >
                            <ItemCard
                              item={item}
                              isNew={newItemIds.has(item.id)}
                              onTogglePacked={() => itemHooks.toggleItemPacked(item.id)}
                              onDelete={() => handleDeleteItem(item.id)}
                              onUpdate={(updates) => itemHooks.updateItem(item.id, updates)}
                              onMoveBag={() => handleMoveBag(item.id, item.bagId)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Item button -- per bag */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 text-muted-foreground hover:text-foreground mt-2"
                      onClick={() => {
                        setAddFormBagId(bag.id);
                        setShowAddForm(true);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add item
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Suggestions */}
          {suggestedItems && (
            <Card className="border-dashed border-muted">
              <CardHeader className="pb-2">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <CardTitle className="text-sm">Quick Add Suggestions</CardTitle>
                  </div>
                  {showSuggestions ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </CardHeader>

              {showSuggestions && (
                <CardContent className="animate-fade-in pt-0">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(suggestedItems).map(([itemName, weight]) => {
                      const isAdded = trip.items.some(i => i.name === itemName);
                      return (
                        <button
                          key={itemName}
                          onClick={() => !isAdded && handleSuggestionClick(itemName, weight)}
                          disabled={isAdded}
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                            transition-all
                            ${isAdded
                              ? 'bg-muted text-muted-foreground/50 cursor-default line-through'
                              : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground active:scale-95'
                            }
                          `}
                        >
                          {!isAdded && <Plus className="w-3 h-3" />}
                          {itemName}
                          <span className="text-muted-foreground/60 text-[10px]">{weight}g</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* Floating Add button (mobile) */}
        {isMobile && (
          <button
            onClick={() => {
              setAddFormBagId(trip.bags[0].id);
              setShowAddForm(true);
            }}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform z-20"
            aria-label="Add item"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Add Item Sheet / Inline Form */}
        <AddItemSheet
          open={showAddForm}
          onOpenChange={setShowAddForm}
          bags={trip.bags}
          defaultBagId={addFormBagId || trip.bags[0].id}
          onAdd={handleAddItem}
          isMobile={isMobile}
        />
      </main>
    </div>
  );
}
