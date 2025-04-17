
import React from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isOpen, 
  isExpanded,
  onClose, 
  onToggleExpand,
  className 
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white rounded-t-xl",
      className
    )}>
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden">
          <img 
            src="/lovable-uploads/4cd661ba-17f4-4106-a5d5-3b2c6c3eebd4.png" 
            alt="Motoro Logo" 
            className="h-8 w-8 object-contain"
          />
        </div>
        <div>
          <h3 className="font-medium">Motoro</h3>
          <p className="text-xs text-white/70">Online</p>
        </div>
      </div>
      <div className="flex space-x-2">
        {isOpen && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-white hover:bg-white/20" 
            onClick={onToggleExpand}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 text-white hover:bg-white/20" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
