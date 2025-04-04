
import { BloodType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BloodTypeTagProps {
  type: BloodType;
  className?: string;
}

export default function BloodTypeTag({ type, className }: BloodTypeTagProps) {
  const getColorByBloodType = (bloodType: BloodType) => {
    switch (bloodType) {
      case 'A+':
      case 'A-':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'B+':
      case 'B-':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AB+':
      case 'AB-':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'O+':
      case 'O-':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
      getColorByBloodType(type),
      className
    )}>
      {type}
    </span>
  );
}
