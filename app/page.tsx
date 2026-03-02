'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import { AnimatedProgressBar } from '@/components/AnimatedProgressBar';
import { useTrips } from '@/hooks/useTrips';
import { BagConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Plus, Trash2, Calendar, Upload, Plane } from 'lucide-react';

export default function Home() {
  const { trips, isLoaded, createTrip, deleteTrip } = useTrips();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    tripType: 'weekend' as const,
    tripDuration: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    departureTime: '09:00',
    returnTime: '17:00',
    ticketFile: null as File | null,
  });
  const [ticketFileName, setTicketFileName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let ticketUrl: string | undefined;
    if (formData.ticketFile) {
      const { fileToBase64 } = await import('@/lib/fileStorage');
      ticketUrl = await fileToBase64(formData.ticketFile);
    }

    createTrip(formData.name, formData.tripType, formData.tripDuration);

    setFormData({
      name: '',
      tripType: 'weekend',
      tripDuration: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      departureTime: '09:00',
      returnTime: '17:00',
      ticketFile: null,
    });
    setTicketFileName('');
    setShowForm(false);
  };

  const handleDelete = (tripId: string) => {
    setDeletingId(tripId);
    setTimeout(() => {
      deleteTrip(tripId);
      setDeletingId(null);
    }, 300);
  };

  const getTotalWeight = (trip: BagConfig) => trip.items.reduce((sum, item) => sum + item.weight, 0);
  const getTotalCapacity = (trip: BagConfig) => trip.bags.reduce((sum, bag) => sum + bag.capacity, 0);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading trips...</p>
        </div>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleCreate} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Trip Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Summer in Barcelona"
          className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Trip Type</label>
          <select
            value={formData.tripType}
            onChange={e => setFormData({ ...formData, tripType: e.target.value as any })}
            className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="weekend">Weekend</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="extended">Extended</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Days</label>
          <input
            type="number"
            min="1"
            max="365"
            value={formData.tripDuration}
            onChange={e => setFormData({ ...formData, tripDuration: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Departure</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Return</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Depart Time</label>
          <input
            type="time"
            value={formData.departureTime}
            onChange={e => setFormData({ ...formData, departureTime: e.target.value })}
            className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Return Time</label>
          <input
            type="time"
            value={formData.returnTime}
            onChange={e => setFormData({ ...formData, returnTime: e.target.value })}
            className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Ticket Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Ticket / Itinerary (Optional)</label>
        <button
          type="button"
          onClick={() => document.getElementById('ticket-input')?.click()}
          className="w-full border-2 border-dashed border-primary/20 rounded-xl p-4 text-center hover:border-primary/40 transition-colors"
        >
          <input
            id="ticket-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.heic"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFormData({ ...formData, ticketFile: e.target.files[0] });
                setTicketFileName(e.target.files[0].name);
              }
            }}
            className="hidden"
          />
          {ticketFileName ? (
            <div className="animate-fade-in">
              <Upload className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-sm text-primary font-medium">{ticketFileName}</p>
            </div>
          ) : (
            <div>
              <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Upload PDF, JPG, PNG</p>
            </div>
          )}
        </button>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" className="flex-1 rounded-xl" size="lg" disabled={!formData.name.trim()}>
          Create Trip
        </Button>
        <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl" size="lg">
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="flex flex-col-reverse md:flex-row min-h-screen bg-background">
      <Navigation />

      {/* Mobile: Drawer for new trip form */}
      <Drawer open={showForm && isMobile} onOpenChange={setShowForm}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>New Trip</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2">{formContent}</div>
          <DrawerFooter />
        </DrawerContent>
      </Drawer>

      <main className="flex-1 pb-20 md:pb-0">
        <Header title="Buggly" description="Your smart packing companion" />

        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground text-balance">My Trips</h2>
              <p className="text-sm text-muted-foreground mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl" size="lg">
              <Plus className="w-5 h-5" />
              New Trip
            </Button>
          </div>

          {/* Desktop: Inline form card */}
          {showForm && !isMobile && (
            <Card className="mb-8 border-primary/30 bg-primary/5 animate-scale-in">
              <CardHeader>
                <CardTitle>Create New Trip</CardTitle>
              </CardHeader>
              <CardContent>{formContent}</CardContent>
            </Card>
          )}

          {trips.length === 0 ? (
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="pt-16 pb-16 text-center">
                <Plane className="w-14 h-14 text-muted-foreground mx-auto mb-5 -rotate-45" />
                <h3 className="text-lg font-semibold text-foreground mb-2 text-balance">No trips yet</h3>
                <p className="text-muted-foreground mb-6 text-sm">Create your first trip to start packing smart.</p>
                <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" />
                  Create a Trip
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trips.map(trip => {
                const totalWeight = getTotalWeight(trip);
                const totalCapacity = getTotalCapacity(trip);
                const percentFull = Math.round((totalWeight / totalCapacity) * 100);
                const packedCount = trip.items.filter(i => i.packed).length;
                const packPercent = trip.items.length > 0
                  ? Math.round((packedCount / trip.items.length) * 100) : 0;
                const isDeleting = deletingId === trip.id;

                return (
                  <div
                    key={trip.id}
                    className={`transition-all ${isDeleting ? 'animate-slide-out-left' : 'animate-fade-in'}`}
                  >
                    <Link href={`/packing/${trip.id}`}>
                      <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer group">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">{trip.name}</CardTitle>
                              <CardDescription className="mt-1.5 flex items-center gap-1.5 text-xs">
                                <Calendar className="w-3 h-3" />
                                {trip.tripDuration} day{trip.tripDuration !== 1 ? 's' : ''} / {trip.tripType}
                              </CardDescription>
                            </div>
                            <button
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(trip.id);
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
                              title="Delete trip"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Weight capacity */}
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-muted-foreground">Weight</span>
                              <span className="font-medium text-foreground">
                                {(totalWeight / 1000).toFixed(1)} / {(totalCapacity / 1000).toFixed(1)} kg
                              </span>
                            </div>
                            <AnimatedProgressBar percent={percentFull} height="h-1.5" />
                          </div>

                          {/* Pack progress */}
                          <div className="pt-2 border-t border-border flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {trip.items.length} items
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-accent progress-bar-animated"
                                  style={{ width: `${packPercent}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">{packPercent}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
