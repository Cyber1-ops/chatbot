
import React from 'react';
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center space-x-1 px-4 py-2", className)}>
      <div className="text-xs text-muted-foreground">Motoro is typing</div>
      <div className="flex space-x-1">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse-dot-1"></div>
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse-dot-2"></div>
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse-dot-3"></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
