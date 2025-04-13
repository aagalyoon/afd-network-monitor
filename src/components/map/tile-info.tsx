import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Check, Info } from 'lucide-react';

export function TileInfo() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4 text-green-500" />
          <span>Map Info</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Local Map Tiles</DialogTitle>
          <DialogDescription>
            Information about the map tiles used in this application
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-green-700 dark:text-green-300">
            <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">All map tiles are stored locally</p>
              <p className="text-sm mt-1 text-green-600 dark:text-green-400">
                All map tiles for the United States (zoom levels 3-8) are included with the application.
                No network connections are required.
              </p>
            </div>
          </div>
          
          <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p>Map Coverage: United States</p>
              <p className="mt-2">The application includes pre-downloaded map tiles covering the entire United States at zoom levels 3-8.</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TileInfo; 