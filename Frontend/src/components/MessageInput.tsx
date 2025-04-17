
import React, { useState, FormEvent, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import ImageUploadButton from './ImageUploadButton';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendImage?: (file: File) => Promise<void>;
  isTyping?: boolean;
  isUploading?: boolean;
  className?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onSendImage,
  isTyping = false,
  isUploading = false,
  className 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isTyping && !isUploading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageUpload = (file: File) => {
    if (onSendImage) {
      onSendImage(file);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("flex items-end gap-2 bg-white border-t p-4", className)}
    >
      {onSendImage && (
        <ImageUploadButton 
          onImageUpload={handleImageUpload} 
          isUploading={isUploading} 
        />
      )}
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="min-h-[60px] resize-none flex-1 border-blue-100 focus-visible:ring-blue-500"
        disabled={isTyping || isUploading}
      />
      <Button 
        type="submit" 
        size="icon" 
        className="bg-blue-500 hover:bg-blue-600 h-[60px] w-[60px] rounded-full"
        disabled={!message.trim() || isTyping || isUploading}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageInput;
