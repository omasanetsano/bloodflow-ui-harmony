
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getColorByStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'fulfilled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reserved':
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'used':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
      getColorByStatus(status),
      className
    )}>
      {status}
    </span>
  );
}
