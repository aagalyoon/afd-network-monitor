import React from 'react';
import NodeListItem from './node-list-item';
import { useNetwork } from '@/context/network-context';

const NodeList: React.FC = () => {
  const { filteredNodes } = useNetwork();

  return (
    <div className="divide-y w-full min-h-[200px]">
      {filteredNodes.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No nodes match the current filters
        </div>
      ) : (
        <>
          {filteredNodes.map((node) => (
            <NodeListItem key={node.id} node={node} />
          ))}
          {/* Invisible spacer to ensure all content is scrollable */}
          <div className="h-16" aria-hidden="true"></div>
        </>
      )}
    </div>
  );
};

export default NodeList;
