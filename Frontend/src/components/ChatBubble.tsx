
import React from 'react';
import { cn } from "@/lib/utils";
import { MessageType } from '@/hooks/useChatMessages';

interface ChatBubbleProps {
  message: MessageType;
  className?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, className }) => {
  const isUser = message.sender === 'user';
  const formattedTime = new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(message.timestamp);

  return (
    <div className={cn(
      "flex w-full animate-fade-in",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 mb-2",
        isUser 
          ? "bg-blue-500 text-white rounded-tr-none" 
          : "bg-gray-100 text-blue-900 rounded-tl-none"
      )}>
        {message.imageUrl && (
          <div className="mb-2 rounded-lg overflow-hidden">
            <img 
              src={message.imageUrl} 
              alt="Uploaded image" 
              className="max-w-full h-auto"
            />
          </div>
        )}
        <p className="text-sm sm:text-base">{message.content}</p>
        <div className={cn(
          "text-xs mt-1 flex justify-end",
          isUser ? "text-white/70" : "text-blue-900/70"
        )}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
