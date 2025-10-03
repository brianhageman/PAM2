import React, { useState } from 'react';
import SendIcon from './icons/SendIcon';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 bg-gray-800 border-t border-gray-700">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask about a physics concept..."
        disabled={isLoading}
        className="flex-grow p-3 bg-gray-700 text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-200 disabled:opacity-50"
        aria-label="Chat input"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-12 h-12 flex-shrink-0 bg-cyan-500 text-white rounded-full flex items-center justify-center hover:bg-cyan-600 active:bg-cyan-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <SendIcon className="w-6 h-6" />
        )}
      </button>
    </form>
  );
};

export default InputBar;