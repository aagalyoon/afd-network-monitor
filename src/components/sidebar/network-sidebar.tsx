import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import NetworkSummary from './network-summary';
import SidebarFilter from './sidebar-filter';
import NodeList from './node-list';
import NodeDetails from './node-details';
import DiagnosticPanel from './diagnostic-panel';
import { useNetwork } from '@/context/network-context';

const NetworkSidebar: React.FC = () => {
  const { selectedNodeId, activeTab, setActiveTab } = useNetwork();
  
  return (
    <div className="h-full border-l bg-background flex flex-col w-[25rem] overflow-hidden">
      <NetworkSummary />
      <Separator />
      
      <Tabs value={activeTab} className="flex flex-col flex-1" onValueChange={(value) => setActiveTab(value as 'nodes' | 'details' | 'diagnostics')}>
        <TabsList className="px-4 pt-4 pb-0 bg-transparent justify-start gap-4 h-auto border-b rounded-none">
          <TabsTrigger value="nodes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5">
            Nodes
          </TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedNodeId} className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5">
            Details
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5">
            Diagnostics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="nodes" className="flex-1 flex flex-col data-[state=inactive]:hidden mt-0">
          <div className="flex-shrink-0">
            <SidebarFilter />
          </div>
          <div className="h-[calc(100vh-350px)] overflow-y-auto overscroll-contain pb-16" style={{ minHeight: '250px' }}>
            <div className="h-auto w-full">
              <NodeList />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="flex-1 data-[state=inactive]:hidden mt-0 overflow-auto">
          <NodeDetails />
        </TabsContent>
        
        <TabsContent value="diagnostics" className="flex-1 data-[state=inactive]:hidden mt-0 overflow-auto">
          <DiagnosticPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkSidebar;
