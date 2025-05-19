// components/dialogs/import-csv-dialog.tsx
import { useState } from 'react';

import { parse } from 'papaparse';

import { Button } from '@documenso/ui/primitives/button';
import { Dialog, DialogContent, DialogTrigger } from '@documenso/ui/primitives/dialog';

export function ImportCsvDialog({
  onImport,
}: {
  onImport: (data: Record<string, string>[]) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      parse(file, {
        header: true,
        complete: (results) => {
          const typedData = (results.data as unknown[]).filter(
            (row): row is Record<string, string> =>
              typeof row === 'object' && row !== null && !Array.isArray(row),
          );
          void onImport(typedData)
            .then(() => setIsOpen(false))
            .finally(() => setIsLoading(false));
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import CSV</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="p-4">
          <h2 className="mb-4 text-lg font-semibold">Import LPM Data from CSV</h2>
          <label className="focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
            {isLoading ? 'Importing...' : 'Select CSV File'}
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
