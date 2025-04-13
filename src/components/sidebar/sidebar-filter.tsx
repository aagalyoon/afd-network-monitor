
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { NodeStatus } from '@/types/network';
import { useNetwork } from '@/context/network-context';

const SidebarFilter: React.FC = () => {
  const { filters, updateFilters } = useNetwork();

  const handleStatusChange = (status: NodeStatus) => {
    const currentStatuses = [...filters.status];
    const statusIndex = currentStatuses.indexOf(status);
    
    if (statusIndex === -1) {
      // Add the status to the filters
      updateFilters({ status: [...currentStatuses, status] });
    } else {
      // Remove the status from the filters
      const newStatuses = [...currentStatuses];
      newStatuses.splice(statusIndex, 1);
      updateFilters({ status: newStatuses });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchTerm: e.target.value });
  };

  return (
    <div className="p-4 border-b">
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search nodes..."
          className="pl-8"
          value={filters.searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Status</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="filter-healthy" 
              checked={filters.status.includes('healthy')}
              onCheckedChange={() => handleStatusChange('healthy')}
              className="border-healthy data-[state=checked]:bg-healthy data-[state=checked]:border-healthy"
            />
            <label
              htmlFor="filter-healthy"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Healthy
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="filter-degraded" 
              checked={filters.status.includes('degraded')}
              onCheckedChange={() => handleStatusChange('degraded')}
              className="border-degraded data-[state=checked]:bg-degraded data-[state=checked]:border-degraded"
            />
            <label
              htmlFor="filter-degraded"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Degraded
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="filter-critical" 
              checked={filters.status.includes('critical')}
              onCheckedChange={() => handleStatusChange('critical')}
              className="border-critical data-[state=checked]:bg-critical data-[state=checked]:border-critical"
            />
            <label
              htmlFor="filter-critical"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Critical
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarFilter;
