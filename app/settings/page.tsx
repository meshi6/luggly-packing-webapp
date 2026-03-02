'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import { useTrips } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function Settings() {
  const { trips } = useTrips();
  const [exportMessage, setExportMessage] = useState('');
  const [importMessage, setImportMessage] = useState('');

  const handleExport = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      trips,
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buggly-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setExportMessage('Backup created successfully!');
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.trips && Array.isArray(data.trips)) {
          localStorage.setItem('buggly_trips', JSON.stringify(data.trips));
          setImportMessage('Backup restored successfully! Refresh the page to see changes.');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          setImportMessage('Invalid backup file format.');
          setTimeout(() => setImportMessage(''), 3000);
        }
      } catch (error) {
        setImportMessage('Failed to import backup. Please check the file format.');
        setTimeout(() => setImportMessage(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (confirm('This will delete all trips. Are you sure?')) {
      localStorage.setItem('buggly_trips', JSON.stringify([]));
      setImportMessage('All data cleared. Refresh the page.');
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row min-h-screen bg-background">
      <Navigation />

      <main className="flex-1 pb-20 md:pb-0">
        <Header title="Settings" description="Manage your data and preferences" />

        <div className="max-w-2xl mx-auto p-6">
          {/* Data Management */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export your trips as a backup or import a previous backup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Export Backup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your trips and items as a JSON file
                  </p>
                  <Button
                    onClick={handleExport}
                    className="gap-2 w-full md:w-auto"
                    variant="secondary"
                  >
                    <Download className="w-4 h-4" />
                    Export All Data
                  </Button>
                  {exportMessage && (
                    <p className="text-sm text-green-600 dark:text-green-400">{exportMessage}</p>
                  )}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <h3 className="font-semibold text-foreground">Import Backup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Restore trips from a previously exported backup
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportChange}
                      className="hidden"
                      id="import-file"
                    />
                    <Button
                      onClick={() => document.getElementById('import-file')?.click()}
                      className="gap-2"
                      variant="secondary"
                    >
                      <Upload className="w-4 h-4" />
                      Import Backup
                    </Button>
                  </div>
                  {importMessage && (
                    <p className="text-sm text-green-600 dark:text-green-400">{importMessage}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Your Buggly usage overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Trips</p>
                    <p className="text-2xl font-bold text-foreground">{trips.length}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold text-foreground">
                      {trips.reduce((sum, trip) => sum + trip.items.length, 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Items Packed</p>
                    <p className="text-2xl font-bold text-primary">
                      {trips.reduce((sum, trip) => sum + trip.items.filter(i => i.packed).length, 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Weight</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(trips.reduce((sum, trip) => sum + trip.items.reduce((s, i) => s + i.weight, 0), 0) / 1000)}
                      <span className="text-lg">kg</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Delete all trips and data. This action cannot be undone.
                </p>
                <Button
                  onClick={handleClearAll}
                  className="gap-2"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
              </CardContent>
            </Card>

            {/* About */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <CardTitle>About Buggly</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Buggly is a smart packing assistant designed to help you organize your travels efficiently.
                </p>
                <p>
                  Version <span className="font-semibold text-foreground">1.0</span>
                </p>
                <p>
                  Your data is stored locally on this device and never sent to any server.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
