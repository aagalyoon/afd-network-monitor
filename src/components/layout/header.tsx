import React from 'react';
import { useTheme } from '@/context/theme-context';
import { useMap } from '@/context/map-context';
import { Button } from '@/components/ui/button';
import { Sun, Moon, RefreshCw, ActivitySquare, Network, MonitorSmartphone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TileInfo from '@/components/map/tile-info';
import { useSettings } from '@/context/settings-context';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { useMockData, toggleMockData } = useSettings();

  const refreshData = () => {
    // AG TODO: Implement this
    window.alert('WIP');
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Network className="h-7 w-7 text-primary mr-2 stroke-[2.5px]" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-primary flex items-center">
                <span>AFD</span>
                <span className="ml-1.5">Network Monitor</span>
              </h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TileInfo />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={refreshData}
                  className="h-9 w-9"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh network data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9"
                >
                  {theme === 'light' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle {theme === 'light' ? 'dark' : 'light'} mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="data-mode" 
                    checked={!useMockData}
                    onCheckedChange={() => toggleMockData()}
                  />
                  <Label htmlFor="data-mode" className="cursor-pointer">
                    {useMockData ? 'Mock Data' : 'Real API'}
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle between mock data and real API calls to the Whiskey servers</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {useMockData 
                    ? "Using simulated network data" 
                    : "Connecting to 10.10.4.161 and 10.10.4.162"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}

export default Header;
