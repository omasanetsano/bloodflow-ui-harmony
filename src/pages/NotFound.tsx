
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { DropletIcon, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="mb-6 inline-flex rounded-full bg-bloodRed-50 p-4">
          <DropletIcon className="h-10 w-10 text-bloodRed-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Oops! The page you're looking for can't be found.
        </p>
        <p className="text-gray-500 mb-8">
          The page at <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code> doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/">
            <HomeIcon className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
