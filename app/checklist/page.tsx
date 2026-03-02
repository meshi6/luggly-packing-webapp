'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import { AnimatedProgressBar } from '@/components/AnimatedProgressBar';
import { Confetti } from '@/components/Confetti';
import { useTrips } from '@/hooks/useTrips';
import { useItems } from '@/hooks/useItems';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, PartyPopper, ChevronDown, ChevronUp } from 'lucide-react';

export default function Checklist() {
  const { trips, isLoaded, updateTrip } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const selectedTrip = selectedTripId ? trips.find(t => t.id === selectedTripId) : null;

  const itemHooks = useItems(selectedTrip, (updates) => {
    if (selectedTripId) updateTrip(selectedTripId, updates);
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [checkingItemId, setCheckingItemId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  // Detect all-packed celebration
  useEffect(() => {
    if (selectedTrip && selectedTrip.items.length > 0) {
      const allPacked = selectedTrip.items.every(i => i.packed);
      if (allPacked && !showCelebration) {
        setShowConfetti(true);
        setShowCelebration(true);
      } else if (!allPacked) {
        setShowCelebration(false);
      }
    }
  }, [selectedTrip, showCelebration]);

  const handleToggleItem = useCallback((itemId: string) => {
    setCheckingItemId(itemId);
    setTimeout(() => {
      itemHooks.toggleItemPacked(itemId);
      setCheckingItemId(null);
    }, 150);
  }, [itemHooks]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col-reverse md:flex-row min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 pb-20 md:pb-0">
          <Header title="Checklist" description="Track your packing progress" />
          <div className="max-w-6xl mx-auto p-6">
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="pt-12 pb-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No trips yet</h3>
                <p className="text-muted-foreground mb-6">Create a trip first to start tracking your packing progress.</p>
                <Link href="/">
                  <Button>Create a Trip</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const packedCount = selectedTrip ? selectedTrip.items.filter(i => i.packed).length : 0;
  const totalItems = selectedTrip ? selectedTrip.items.length : 0;
  const packPercent = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

  return (
    <div className="flex flex-col-reverse md:flex-row min-h-screen bg-background">
      <Navigation />

      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}

      <main className="flex-1 pb-20 md:pb-0">
        <Header title="Packing Checklist" description="Check off items as you pack" />

        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Trip Selector */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">My Trips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {trips.map(trip => {
                    const tp = trip.items.filter(i => i.packed).length;
                    const tt = trip.items.length;
                    const pct = tt > 0 ? Math.round((tp / tt) * 100) : 0;

                    return (
                      <button
                        key={trip.id}
                        onClick={() => setSelectedTripId(trip.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                          selectedTripId === trip.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        <p className="font-medium text-sm">{trip.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-background/30 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full progress-bar-animated ${
                                selectedTripId === trip.id ? 'bg-primary-foreground/60' : 'bg-primary'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] opacity-75">{pct}%</span>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Checklist */}
            <div className="md:col-span-3 space-y-4">
              {selectedTrip && (
                <>
                  {/* Progress Card */}
                  <Card className={`transition-all ${showCelebration ? 'border-accent bg-accent/5' : ''}`}>
                    <CardContent className="pt-6">
                      {showCelebration ? (
                        <div className="text-center py-4 animate-scale-in">
                          <PartyPopper className="w-12 h-12 text-accent mx-auto mb-3" />
                          <h3 className="text-xl font-bold text-foreground">{"You're all packed!"}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Every item is checked off. Have a great trip!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Progress</p>
                              <p className="text-2xl font-bold text-foreground leading-tight mt-0.5">
                                {packedCount} <span className="text-sm font-normal text-muted-foreground">of {totalItems} items</span>
                              </p>
                            </div>
                            <p className="text-3xl font-bold text-primary">{packPercent}%</p>
                          </div>
                          <AnimatedProgressBar percent={packPercent} height="h-3" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Items by Category */}
                  {totalItems === 0 ? (
                    <Card className="border-dashed border-2 border-muted">
                      <CardContent className="pt-8 pb-8 text-center">
                        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">No items added yet</p>
                        <Link href={`/packing/${selectedTrip.id}`}>
                          <Button variant="outline" size="sm">Go to Packing Board</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    (() => {
                      const categories = Array.from(new Set(selectedTrip.items.map(i => i.category)));
                      return categories.map(category => {
                        const categoryItems = selectedTrip.items.filter(i => i.category === category);
                        const categoryPacked = categoryItems.filter(i => i.packed).length;
                        const catPercent = Math.round((categoryPacked / categoryItems.length) * 100);
                        const isCollapsed = collapsedCategories.has(category);

                        // Sort: packed items at bottom
                        const sortedItems = [...categoryItems].sort((a, b) => {
                          if (a.packed === b.packed) return 0;
                          return a.packed ? 1 : -1;
                        });

                        return (
                          <Card key={category} className={`transition-all ${catPercent === 100 ? 'opacity-70' : ''}`}>
                            <CardHeader className="pb-3">
                              <button
                                onClick={() => toggleCategory(category)}
                                className="flex items-center justify-between w-full"
                              >
                                <div className="flex items-center gap-3">
                                  <div>
                                    <CardTitle className="text-base text-left">{category}</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {categoryPacked} of {categoryItems.length} packed
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm font-bold ${catPercent === 100 ? 'text-accent' : 'text-primary'}`}>
                                    {catPercent}%
                                  </span>
                                  {isCollapsed ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              </button>
                              <AnimatedProgressBar percent={catPercent} height="h-1.5" className="mt-2" />
                            </CardHeader>

                            {!isCollapsed && (
                              <CardContent className="animate-fade-in pt-0">
                                <div className="space-y-1">
                                  {sortedItems.map(item => (
                                    <button
                                      key={item.id}
                                      onClick={() => handleToggleItem(item.id)}
                                      className={`
                                        w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left
                                        ${checkingItemId === item.id ? 'item-check-anim' : ''}
                                        ${item.packed
                                          ? 'bg-muted/50'
                                          : 'bg-muted hover:bg-muted/80'
                                        }
                                      `}
                                    >
                                      {/* Custom checkbox */}
                                      <div className={`
                                        w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                                        transition-all duration-200
                                        ${item.packed
                                          ? 'bg-primary border-primary'
                                          : 'border-muted-foreground'
                                        }
                                      `}>
                                        {item.packed && (
                                          <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        )}
                                      </div>

                                      {item.photoUrl && (
                                        <img
                                          src={item.photoUrl}
                                          alt=""
                                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                                        />
                                      )}

                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium transition-all ${
                                          item.packed ? 'line-through text-muted-foreground' : 'text-foreground'
                                        }`}>
                                          {item.name}
                                          {item.size && <span className="text-xs text-muted-foreground ml-1">({item.size})</span>}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {selectedTrip.bags.find(b => b.id === item.bagId)?.name || 'Unassigned'} / {item.weight}g
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        );
                      });
                    })()
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
