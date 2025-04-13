import React from 'react';
import Header from '@/components/layout/header';
import NetworkMap from '@/components/network/network-map';
import NetworkSidebar from '@/components/sidebar/network-sidebar';
import { useNetwork } from '@/context/network-context';
import { ThemeProvider } from '@/context/theme-context';
import { NetworkProvider } from '@/context/network-context';
import { MapProvider } from '@/context/map-context';
import { SettingsProvider } from '@/context/settings-context';

const NetworkContent = () => {
  const { filteredNodes, connections } = useNetwork();
  
  return (
    <>
      <div className="flex-1">
        <NetworkMap nodes={filteredNodes} connections={connections} />
      </div>
      <NetworkSidebar />
    </>
  );
};

const Index = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <NetworkProvider>
          <MapProvider>
            <div className="flex flex-col h-screen overflow-hidden">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <NetworkContent />
              </div>
            </div>
          </MapProvider>
        </NetworkProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default Index;
