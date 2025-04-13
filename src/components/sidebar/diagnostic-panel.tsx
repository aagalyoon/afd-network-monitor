
import React from 'react';
import { useNetwork } from '@/context/network-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '@/components/ui/code-block';
import { ScrollArea } from '@/components/ui/scroll-area';

const DiagnosticPanel: React.FC = () => {
  const { diagnostics } = useNetwork();
  
  // Get the latest ping and traceroute results
  const latestPing = diagnostics.find(d => d.commandType === 'ping');
  const latestTraceroute = diagnostics.find(d => d.commandType === 'traceroute');
  
  if (!latestPing && !latestTraceroute) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No diagnostic results available.
        <br />
        Select a node and run diagnostics to see results.
      </div>
    );
  }
  
  return (
    <Tabs defaultValue={latestPing ? 'ping' : 'traceroute'} className="p-4">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="ping" disabled={!latestPing}>Ping</TabsTrigger>
        <TabsTrigger value="traceroute" disabled={!latestTraceroute}>Traceroute</TabsTrigger>
      </TabsList>
      
      <TabsContent value="ping" className="mt-2">
        {latestPing && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="font-medium">
                Ping to {latestPing.target}
              </div>
              <div className="text-muted-foreground">
                {new Date(latestPing.timestamp).toLocaleTimeString()}
              </div>
            </div>
            
            <ScrollArea className="h-40">
              <CodeBlock content={latestPing.results} />
            </ScrollArea>
            
            {latestPing.metrics && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Min Latency:</span>{' '}
                  <span>{latestPing.metrics.minLatency} ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Latency:</span>{' '}
                  <span>{latestPing.metrics.maxLatency} ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Latency:</span>{' '}
                  <span>{latestPing.metrics.avgLatency} ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Packet Loss:</span>{' '}
                  <span>{latestPing.metrics.packetLoss}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="traceroute" className="mt-2">
        {latestTraceroute && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="font-medium">
                Traceroute to {latestTraceroute.target}
              </div>
              <div className="text-muted-foreground">
                {new Date(latestTraceroute.timestamp).toLocaleTimeString()}
              </div>
            </div>
            
            <ScrollArea className="h-48">
              <CodeBlock content={latestTraceroute.results} />
            </ScrollArea>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default DiagnosticPanel;
