
import { ConstructionIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PageUnderConstructionProps {
  title: string;
  description?: string;
}

export default function PageUnderConstruction({ title, description }: PageUnderConstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-yellow-100 p-4 rounded-full text-yellow-600 mb-6">
        <ConstructionIcon className="h-12 w-12" />
      </div>
      <h1 className="text-2xl font-bold mb-3">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        {description || "This page is currently under construction. Please check back later."}
      </p>
      <Button asChild>
        <Link to="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
