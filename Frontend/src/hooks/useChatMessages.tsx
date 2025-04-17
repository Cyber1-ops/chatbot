
import { useState, useEffect, useCallback } from 'react';

export type MessageType = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  imageUrl?: string;
};

export type UseChatMessagesReturn = {
  messages: MessageType[];
  isTyping: boolean;
  isUploading: boolean;
  sendMessage: (content: string) => void;
  sendImage: (file: File) => Promise<void>;
  clearMessages: () => void;
};

export const useChatMessages = (): UseChatMessagesReturn => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      content: 'Hello! I am Motoro, your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Function to generate a bot response
  const generateBotResponse = useCallback((userMessage: string): Promise<string> => {
    // This is a mock function. In a real app, this would call your API
    return new Promise((resolve) => {
      const responses = [
        "I understand you're asking about that. Let me help you with it.",
        "That's an interesting question! Here's what I think...",
        "I'm here to help with questions like that.",
        "I've got some information that might help with your query.",
        "Thanks for your question. Let me provide some assistance.",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simulate network delay
      setTimeout(() => {
        resolve(randomResponse);
      }, 1500);
    });
  }, []);

  // Function to send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Get bot response
      const botResponse = await generateBotResponse(content);
      
      // Add bot message
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating bot response:', error);
    } finally {
      setIsTyping(false);
    }
  }, [generateBotResponse]);

  // Function to upload an image
  const sendImage = useCallback(async (file: File) => {
    setIsUploading(true);
    
    try {
      // In a real app, this would be an actual upload to a server
      // Here we're just creating a local URL for demo purposes
      const imageUrl = URL.createObjectURL(file);
      
      // Add user image message
      const userImageMessage: MessageType = {
        id: Date.now().toString(),
        content: 'Image sent',
        sender: 'user',
        timestamp: new Date(),
        imageUrl: imageUrl,
      };
      
      setMessages((prev) => [...prev, userImageMessage]);
      
      // Show typing indicator
      setIsTyping(true);
      
      // Simulate bot response
      setTimeout(() => {
        // Add bot message
        const botMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          content: "I've received your image. What would you like to know about it?",
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Function to clear all messages
  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        content: 'Hello! I am Motoro, your AI assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return { messages, isTyping, isUploading, sendMessage, sendImage, clearMessages };
};
