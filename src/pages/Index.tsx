import React from 'react';
import Header from '@/components/layout/header';
import NetworkMap from '@/components/network/network-map';
import NetworkSidebar from '@/components/sidebar/network-sidebar';
import { useNetwork } from '@/context/network-context';
import { ThemeProvider } from '@/context/theme-context';
import { NetworkProvider } from '@/context/network-context';
import { MapProvider } from '@/context/map-context';

const Index = () => {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
};

// Separate component to use the network context after it's provided
const NetworkContent = () => {
  const { nodes, connections } = useNetwork();
  
  return (
    <>
      <div className="flex-1">
        <NetworkMap nodes={nodes} connections={connections} />
      </div>
      <NetworkSidebar />
    </>
  );
};

export default Index;
