
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  valueClassName?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  trendValue,
  className,
  valueClassName
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">{icon}</div>}
        </div>
        <div className="mt-2">
          <p className={cn("text-2xl font-bold", valueClassName || "text-foreground")}>{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        {trend && trendValue && (
          <div className="mt-3 flex items-center gap-1">
            {trend === 'up' ? (
              <>
                <TrendingUpIcon className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium text-green-500">{trendValue}</span>
              </>
            ) : trend === 'down' ? (
              <>
                <TrendingDownIcon className="h-3 w-3 text-red-500" />
                <span className="text-xs font-medium text-red-500">{trendValue}</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">{trendValue}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
