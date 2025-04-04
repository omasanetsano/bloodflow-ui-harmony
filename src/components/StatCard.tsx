
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function StatCard({ 
  title, 
  value, 
  description,
  icon, 
  className,
  trend,
  trendValue
}: StatCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm p-6 border border-gray-100',
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {trend && trendValue && (
            <div className="mt-2 flex items-center text-sm">
              <span className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium',
                trend === 'up' ? 'bg-green-100 text-green-800' : 
                trend === 'down' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              )}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-bloodRed-50 rounded-full">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
