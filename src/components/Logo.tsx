
import { DropletIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", showText = true, className }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <DropletIcon 
          className={cn("text-bloodRed-500", sizeClasses[size])}
          style={{ filter: "drop-shadow(0 0 3px rgba(229, 34, 34, 0.3))" }}
        />
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xs">
          +
        </span>
      </div>
      {showText && (
        <span className={cn(
          "font-bold tracking-tight text-foreground leading-none", 
          textSizeClasses[size]
        )}>
          <span className="text-bloodRed-500">Life</span>
          <span>Flow</span>
        </span>
      )}
    </div>
  );
}
