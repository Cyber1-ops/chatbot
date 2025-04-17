
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatMessages } from '@/hooks/useChatMessages';
import ChatHeader from '@/components/ChatHeader';
import ChatBubble from '@/components/ChatBubble';
import MessageInput from '@/components/MessageInput';
import TypingIndicator from '@/components/TypingIndicator';

interface ChatInterfaceProps {
  initialOpen?: boolean;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  initialOpen = false,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isTyping, isUploading, sendMessage, sendImage, clearMessages } = useChatMessages();

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "flex flex-col rounded-xl shadow-xl bg-white border border-gray-200 mb-4 transition-all duration-300 overflow-hidden",
            isExpanded ? "fixed top-6 left-6 right-6 bottom-6" : "w-96 h-[500px]"
          )}
        >
          <ChatHeader 
            isOpen={isOpen} 
            isExpanded={isExpanded}
            onClose={toggleChat} 
            onToggleExpand={toggleExpand}
          />
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator className="mt-2" />}
            <div ref={messagesEndRef} />
          </div>
          
          <MessageInput 
            onSendMessage={sendMessage}
            onSendImage={sendImage}
            isTyping={isTyping}
            isUploading={isUploading}
          />
        </div>
      )}
      
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg flex items-center justify-center transition-all duration-300",
          isOpen ? "rotate-90" : "animate-bounce"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ChatInterface;
