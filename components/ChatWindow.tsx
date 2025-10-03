
import React, { useEffect, useRef } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom whenever messages change or loading state changes.
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-grow p-4 md:p-6 overflow-y-auto">
      {messages.map((msg, index) => {
        const isStreaming = 
          index === messages.length - 1 && 
          msg.sender === 'ai' && 
          isLoading;

        return (
          <Message
            key={msg.id}
            message={msg}
            isStreaming={isStreaming}
          />
        );
      })}
      {/* The streaming message itself provides a better loading indicator than a separate component */}
    </div>
  );
};

export default ChatWindow;
