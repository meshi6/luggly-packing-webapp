# Buggly - Smart Packing Assistant

A modern, intuitive web app to help travelers pack smarter and more efficiently.

## Features

### 🎒 Trip Management
- Create multiple trips with custom names and durations
- Choose trip types: weekend, week, month, or extended travel
- View all trips on the dashboard with capacity overview
- Delete trips you no longer need

### 📦 Packing Board (Main Feature)
- **Dual Bag System**: Organize items into multiple bags (Main Bag, Daypack, etc.)
- **Weight Tracking**: Real-time weight calculation with visual capacity indicators
- **Smart Suggestions**: Get intelligent item suggestions based on your trip type
- **Drag & Organize**: Move items between bags as needed
- **Item Details**: Track each item's category, weight, and packing status

### ✅ Packing Checklist
- View all items organized by category
- See packing progress with visual completion bars
- Track items across multiple trips
- Quick checkbox to mark items as packed

### ⚙️ Settings & Data Management
- **Export Backup**: Download all trips as JSON for safekeeping
- **Import Backup**: Restore trips from a previously exported backup
- **Statistics**: View your Buggly usage overview
- **Clear Data**: Remove all data when needed

### 📱 Responsive Design
- Optimized for mobile devices with bottom navigation bar
- Desktop layout with side navigation for efficient use
- Touch-friendly interface for on-the-go packing

## How to Use

### Creating a Trip
1. Go to the Home page
2. Click "New Trip"
3. Enter trip name, type, and duration
4. Start adding items

### Packing Items
1. Go to "Pack" (Packing Board) from any trip
2. Click "Add Item" to add a new item
3. Fill in item name, category, weight, and target bag
4. Use suggested items for quick additions
5. Check items off as you pack them

### Tracking Progress
- Dashboard shows weight capacity for each trip
- Packing Board has visual progress bars
- Checklist view shows category-by-category completion

### Backup & Restore
1. Go to Settings
2. Use "Export All Data" to create a backup
3. Use "Import Backup" to restore from a backup file

## Data Storage

All data is stored locally in your browser using localStorage. Your data never leaves your device and is not sent to any server.

## Technical Details

- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React hooks with localStorage persistence
- **Components**: shadcn/ui components
- **Icons**: Lucide React icons

## File Structure

```
app/
├── layout.tsx              # Root layout with metadata
├── page.tsx                # Home/Dashboard page
├── packing/
│   ├── page.tsx           # Packing redirect
│   └── [id]/page.tsx      # Packing board for specific trip
├── checklist/
│   └── page.tsx           # Packing checklist page
└── settings/
    └── page.tsx           # Settings & data management

components/
├── Navigation.tsx          # Bottom/side navigation
├── Header.tsx             # Page header component
└── ui/                    # shadcn/ui components

hooks/
├── useTrips.ts            # Trip management hook
└── useItems.ts            # Item operations hook

lib/
└── types.ts               # TypeScript types and constants
```

## Tips for Efficient Packing

1. **Start with Trip Type**: The app suggests items based on your trip type
2. **Use Categories**: Organize items by type (Clothing, Electronics, etc.)
3. **Track Weight**: Keep an eye on bag capacity to avoid overpacking
4. **Plan Multiple Bags**: Use different bags for different purposes
5. **Create Backups**: Export your data regularly for safety

## Browser Compatibility

Works on all modern browsers that support:
- ES6+ JavaScript
- localStorage
- CSS Grid and Flexbox

## Future Enhancements

- Cloud sync across devices
- Shared packing lists
- Item templates for common trips
- Packing tips and recommendations
- Integration with travel itineraries

---

Happy packing! 🎒✈️
