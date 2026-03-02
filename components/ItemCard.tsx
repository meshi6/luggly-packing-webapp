'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Item } from '@/lib/types';
import { Trash2, ArrowRightLeft } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onTogglePacked: () => void;
  onDelete: () => void;
  onUpdate?: (updates: Partial<Item>) => void;
  onMoveBag?: () => void;
  isNew?: boolean;
}

export function ItemCard({ item, onTogglePacked, onDelete, onUpdate, onMoveBag, isNew }: ItemCardProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Swipe state
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchLocked = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchLocked.current = false;
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Determine direction lock on first meaningful movement
    if (!touchLocked.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      touchLocked.current = true;
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical scroll -- don't interfere
        return;
      }
      setIsSwiping(true);
    }

    if (isSwiping || (touchLocked.current && Math.abs(dx) > Math.abs(dy))) {
      setIsSwiping(true);
      // Clamp swipe range with resistance
      const clampedX = dx > 0
        ? Math.min(dx * 0.6, SWIPE_THRESHOLD + 20)
        : Math.max(dx * 0.6, -(SWIPE_THRESHOLD + 20));
      setSwipeX(clampedX);
    }
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (swipeX < -SWIPE_THRESHOLD) {
      // Swiped left: delete
      setIsRemoving(true);
      setTimeout(() => onDelete(), 300);
    } else if (swipeX > SWIPE_THRESHOLD && onMoveBag) {
      // Swiped right: move bag
      onMoveBag();
    }
    setSwipeX(0);
    setIsSwiping(false);
    touchLocked.current = false;
  }, [swipeX, onDelete, onMoveBag]);

  const handleTogglePacked = useCallback(() => {
    setIsChecking(true);
    onTogglePacked();
    setTimeout(() => setIsChecking(false), 350);
  }, [onTogglePacked]);

  const startEdit = (field: string, value: string) => {
    if (editingField) return;
    setEditingField(field);
    setEditValue(value);
  };

  const commitEdit = () => {
    if (!editingField || !onUpdate) return;
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== String(item[editingField as keyof Item])) {
      if (editingField === 'weight') {
        const num = parseInt(trimmed);
        if (!isNaN(num) && num > 0) onUpdate({ weight: num });
      } else if (editingField === 'name') {
        onUpdate({ name: trimmed });
      } else if (editingField === 'brand') {
        onUpdate({ brand: trimmed || undefined });
      } else if (editingField === 'size') {
        onUpdate({ size: trimmed || undefined });
      }
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') { setEditingField(null); setEditValue(''); }
  };

  if (isRemoving) {
    return <div className="animate-slide-out-left" />;
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Swipe background hints */}
      <div className="absolute inset-0 flex">
        <div className={`flex-1 flex items-center justify-start pl-4 bg-accent/20 transition-opacity ${swipeX > 20 ? 'opacity-100' : 'opacity-0'}`}>
          <ArrowRightLeft className="w-5 h-5 text-accent-foreground" />
        </div>
        <div className={`flex-1 flex items-center justify-end pr-4 bg-destructive/20 transition-opacity ${swipeX < -20 ? 'opacity-100' : 'opacity-0'}`}>
          <Trash2 className="w-5 h-5 text-destructive" />
        </div>
      </div>

      <div
        ref={cardRef}
        className={`
          relative flex items-center gap-3 p-3 bg-muted rounded-lg
          transition-colors select-none
          ${isChecking ? 'item-check-anim' : ''}
          ${isNew ? 'animate-slide-up' : ''}
          ${item.packed ? 'opacity-60' : ''}
        `}
        style={{
          transform: isSwiping ? `translateX(${swipeX}px)` : 'translateX(0)',
          transition: isSwiping ? 'none' : 'transform 0.25s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Checkbox */}
        <button
          onClick={handleTogglePacked}
          className={`
            w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
            transition-all duration-200
            ${item.packed
              ? 'bg-primary border-primary'
              : 'border-muted-foreground hover:border-primary'
            }
          `}
          aria-label={item.packed ? 'Mark as unpacked' : 'Mark as packed'}
        >
          {item.packed && (
            <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Photo thumbnail */}
        {item.photoUrl && (
          <img
            src={item.photoUrl}
            alt={item.name}
            className="w-10 h-10 rounded object-cover flex-shrink-0 border border-border"
          />
        )}

        {/* Content area -- tappable for inline edits */}
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-baseline gap-2">
            {editingField === 'name' ? (
              <input
                type="text"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                className="text-sm font-medium bg-card border border-primary rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                autoFocus
              />
            ) : (
              <button
                onClick={() => onUpdate && startEdit('name', item.name)}
                className={`text-sm font-medium text-left truncate ${item.packed ? 'line-through text-muted-foreground' : 'text-foreground hover:text-primary'} transition-colors`}
              >
                {item.name}
              </button>
            )}
            {item.size && !editingField && (
              <button
                onClick={() => onUpdate && startEdit('size', item.size || '')}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
              >
                ({item.size})
              </button>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            {item.brand && (
              <>
                {editingField === 'brand' ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    className="text-xs bg-card border border-primary rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => onUpdate && startEdit('brand', item.brand || '')}
                    className="hover:text-primary transition-colors"
                  >
                    {item.brand}
                  </button>
                )}
                <span className="text-muted-foreground/50">{'/'}</span>
              </>
            )}
            <span>{item.category}</span>
            <span className="text-muted-foreground/50">{'/'}</span>
            {editingField === 'weight' ? (
              <input
                type="number"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                className="text-xs bg-card border border-primary rounded px-1 py-0.5 w-16 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                autoFocus
                min="1"
              />
            ) : (
              <button
                onClick={() => onUpdate && startEdit('weight', String(item.weight))}
                className="hover:text-primary transition-colors"
              >
                {item.weight}g
              </button>
            )}
          </div>
        </div>

        {/* Delete (desktop) */}
        <button
          onClick={() => {
            setIsRemoving(true);
            setTimeout(() => onDelete(), 300);
          }}
          className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 hidden md:block"
          title="Delete item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
