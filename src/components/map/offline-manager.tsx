import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { useMap } from '@/context/map-context';
import { useToast } from '@/components/ui/use-toast';
import { registerServiceWorker } from '@/lib/service-worker-registration';

export function OfflineManager() {
  const { toast } = useToast();
  const { isOfflineMode } = useMap();
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Register service worker on component mount
  useEffect(() => {
    const initServiceWorker = async () => {
      const registration = await registerServiceWorker();
      setServiceWorkerReady(!!registration);
    };
    
    initServiceWorker();
  }, []);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4 text-green-500" />
          <span>Map Status</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>US Map Tiles Status</DialogTitle>
          <DialogDescription>
            Information about offline map availability
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-green-700 dark:text-green-300">
            <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">United States map tiles are pre-downloaded</p>
              <p className="text-sm mt-1 text-green-600 dark:text-green-400">
                All map tiles for the United States (zoom levels 3-8) are automatically cached when the application loads.
              </p>
            </div>
          </div>
          
          <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p>You can toggle offline mode using the WiFi button in the header.</p>
              <p className="mt-2">In offline mode, the application will only use pre-cached map tiles and won't attempt to download new ones.</p>
            </div>
          </div>
          
          {isOfflineMode && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200">
              <p className="font-medium">You're currently in offline mode</p>
              <p className="mt-1">The map is using pre-cached tiles without making any network requests.</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OfflineManager; 