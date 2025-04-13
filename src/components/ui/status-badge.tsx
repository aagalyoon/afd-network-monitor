
import React from 'react';
import { NodeStatus } from '@/types/network';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: NodeStatus;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showText = true,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className={cn("h-4 w-4", size === 'lg' && 'h-5 w-5')} />;
      case 'degraded':
        return <AlertTriangle className={cn("h-4 w-4", size === 'lg' && 'h-5 w-5')} />;
      case 'critical':
        return <AlertCircle className={cn("h-4 w-4", size === 'lg' && 'h-5 w-5')} />;
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'degraded':
        return 'Degraded';
      case 'critical':
        return 'Critical';
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        `status-${status}`,
        status === 'healthy' && 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900',
        status === 'degraded' && 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900',
        status === 'critical' && 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900',
        sizeClasses[size],
        className
      )}
    >
      {getStatusIcon()}
      {showText && <span>{getStatusText()}</span>}
    </div>
  );
};

export default StatusBadge;
