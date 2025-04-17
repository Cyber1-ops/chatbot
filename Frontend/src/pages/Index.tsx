
import React from 'react';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center my-16">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/4cd661ba-17f4-4106-a5d5-3b2c6c3eebd4.png" 
              alt="Motoro Logo" 
              className="h-16 w-16"
            />
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Motoro AI Chat Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A powerful AI assistant with image sharing capabilities. Click the chat icon
            in the bottom-right corner to start a conversation.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Features
          </h2>
          
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white mr-2 text-xs">✓</span>
              <span>Floating chat bubble for easy access</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white mr-2 text-xs">✓</span>
              <span>Expandable chat window for better readability</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white mr-2 text-xs">✓</span>
              <span>Share images directly in your conversation</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white mr-2 text-xs">✓</span>
              <span>Visual typing indicators</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white mr-2 text-xs">✓</span>
              <span>Modern UI with smooth animations</span>
            </li>
          </ul>
        </div>
      </div>
      
      <ChatInterface />
    </div>
  );
};

export default Index;
