'use client';

import { useState, useEffect, useRef } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ITEM_CATEGORIES, Bag } from '@/lib/types';
import { BASE_ITEM_WEIGHTS } from '@/lib/constants';
import { estimateWeight } from '@/lib/weightEstimator';
import { Camera, Plus } from 'lucide-react';

interface AddItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bags: Bag[];
  defaultBagId: string;
  onAdd: (item: {
    name: string;
    category: string;
    weight: number;
    bagId: string;
    size?: string;
    brand?: string;
    photoUrl?: string;
  }) => void;
  isMobile: boolean;
}

export function AddItemSheet({ open, onOpenChange, bags, defaultBagId, onAdd, isMobile }: AddItemSheetProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(ITEM_CATEGORIES[0]);
  const [weight, setWeight] = useState(100);
  const [bagId, setBagId] = useState(defaultBagId);
  const [size, setSize] = useState('');
  const [brand, setBrand] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [weightAutoFilled, setWeightAutoFilled] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBagId(defaultBagId);
  }, [defaultBagId]);

  // Auto-focus name field when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 150);
    }
  }, [open]);

  // Auto-fill weight when name changes
  useEffect(() => {
    if (!name.trim()) return;
    const estimated = estimateWeight(name, size || undefined);
    if (estimated !== 100 || name.toLowerCase() in BASE_ITEM_WEIGHTS) {
      setWeight(estimated);
      setWeightAutoFilled(true);
    }
  }, [name, size]);

  const reset = () => {
    setName('');
    setCategory(ITEM_CATEGORIES[0]);
    setWeight(100);
    setSize('');
    setBrand('');
    setPhotoUrl('');
    setPhotoPreview('');
    setWeightAutoFilled(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      category,
      weight,
      bagId,
      size: size || undefined,
      brand: brand || undefined,
      photoUrl: photoUrl || undefined,
    });
    reset();
    onOpenChange(false);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setPhotoUrl(url);
        setPhotoPreview(url);
        // Auto-focus name after photo capture
        setTimeout(() => nameRef.current?.focus(), 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formContent = (
    <div className="space-y-4">
      {/* Photo preview */}
      {photoPreview && (
        <div className="flex items-center gap-3 animate-fade-in">
          <img src={photoPreview} alt="Item" className="w-16 h-16 rounded-lg object-cover border border-border" />
          <button
            onClick={() => { setPhotoUrl(''); setPhotoPreview(''); }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Remove photo
          </button>
        </div>
      )}

      {/* Name -- primary input */}
      <div>
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are you packing?"
          className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground text-base font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Quick row: category + bag */}
      <div className="flex gap-3">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="flex-1 px-3 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {ITEM_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={bagId}
          onChange={e => setBagId(e.target.value)}
          className="flex-1 px-3 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {bags.map(bag => (
            <option key={bag.id} value={bag.id}>{bag.name}</option>
          ))}
        </select>
      </div>

      {/* Details row: size, weight, brand */}
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={size}
            onChange={e => setSize(e.target.value)}
            placeholder="Size"
            className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex-1 relative">
          <input
            type="number"
            value={weight}
            onChange={e => { setWeight(parseInt(e.target.value) || 0); setWeightAutoFilled(false); }}
            min="1"
            className={`w-full px-3 py-2.5 border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-8 ${weightAutoFilled ? 'border-accent' : 'border-border'}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">g</span>
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder="Brand"
            className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Photo + Submit */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => document.getElementById('sheet-photo-input')?.click()}
          className="px-4 py-2.5 border border-border rounded-xl bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2 text-sm"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Photo</span>
        </button>
        <input
          id="sheet-photo-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
          className="hidden"
        />
        <Button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 rounded-xl gap-2"
          size="lg"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>
    </div>
  );

  // Mobile: Vaul drawer from bottom
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Item</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2">
            {formContent}
          </div>
          <DrawerFooter />
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: inline card below the button
  if (!open) return null;

  return (
    <div className="animate-scale-in">
      <div className="border border-primary/30 bg-primary/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground">Add Item</h3>
          <button
            onClick={() => { reset(); onOpenChange(false); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
        {formContent}
      </div>
    </div>
  );
}
