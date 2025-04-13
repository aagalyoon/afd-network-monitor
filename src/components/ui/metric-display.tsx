import React from 'react';
import { cn } from '@/lib/utils';
import { NodeStatus } from '@/types/network';

interface MetricDisplayProps {
  label: string;
  value: number | string;
  unit?: string;
  showThresholds?: boolean;
  thresholdLow?: number;
  thresholdHigh?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  status?: NodeStatus;
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  unit = '',
  showThresholds = false,
  thresholdLow = 50,
  thresholdHigh = 80,
  className,
  size = 'md',
  orientation = 'vertical',
  status,
}) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString());
  
  // Determine severity based on thresholds or directly from status prop
  const getSeverityClass = () => {
    // If status is provided, use it directly
    if (status) {
      if (status === 'critical') return 'text-critical';
      if (status === 'degraded') return 'text-degraded';
      if (status === 'healthy') return 'text-healthy';
      return '';
    }
    
    // Otherwise use the threshold logic
    if (!showThresholds || isNaN(numericValue)) return '';
    
    if (numericValue >= thresholdHigh) return 'text-critical';
    if (numericValue >= thresholdLow) return 'text-degraded';
    return 'text-healthy';
  };
  
  // Size classes for different display sizes
  const sizeClasses = {
    sm: {
      container: 'text-xs gap-0.5',
      label: 'text-xs',
      value: 'text-sm font-medium',
    },
    md: {
      container: 'text-sm gap-1',
      label: 'text-xs',
      value: 'text-base font-medium',
    },
    lg: {
      container: 'text-base gap-1',
      label: 'text-sm',
      value: 'text-xl font-medium',
    },
  };
  
  return (
    <div
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row items-center justify-between',
        sizeClasses[size].container,
        className
      )}
    >
      <div className={cn('text-muted-foreground', sizeClasses[size].label)}>
        {label}
      </div>
      <div className={cn('flex items-baseline gap-1', getSeverityClass(), sizeClasses[size].value)}>
        <span>{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
};

export default MetricDisplay;
