import React from 'react';
import { Message as MessageType } from '../types';
import BotIcon from './icons/BotIcon';

// This function parses a string for KaTeX delimiters and renders the math.
// It returns an array of strings and React elements.
export const renderMessageWithKatex = (text: string) => {
  try {
    // Return raw text if katex is not available on the window object yet
    if (!text || typeof window.katex === 'undefined') {
      return text;
    }

    // Regex to split the text by $...$ and $$...$$ delimiters, keeping the delimiters
    const splitRegex = /(\$\$.*?\$\$|\$.*?\$)/g;
    const parts = text.split(splitRegex).filter(part => part); // filter out empty strings

    return parts.map((part, index) => {
      // Handle display mode math ($$ ... $$)
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.substring(2, part.length - 2);
        const html = window.katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
          trust: true,
        });
        return <div key={index} dangerouslySetInnerHTML={{ __html: html }} />;
      }
      // Handle inline mode math ($ ... $)
      else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.substring(1, part.length - 1);
        const html = window.katex.renderToString(math, {
          displayMode: false,
          throwOnError: false,
          trust: true,
        });
        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
      }
      // Return the text part as is
      else {
        return part;
      }
    });
  } catch (error) {
    console.error('Failed to render KaTeX:', error);
    return text; // Fallback to raw text on error
  }
};

const Message: React.FC<{ message: MessageType; isStreaming: boolean }> = ({ message, isStreaming }) => {
  const isUser = message.sender === 'user';

  // For user messages and final AI messages, render with KaTeX.
  // For streaming AI messages, just show the plain text to avoid rendering incomplete formulas.
  const content = isUser || !isStreaming ? renderMessageWithKatex(message.text) : message.text;

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          <BotIcon className="w-6 h-6 text-cyan-400" />
        </div>
      )}
      <div
        className={`max-w-md lg:max-w-xl px-4 py-3 rounded-xl shadow-md break-words ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-200 rounded-bl-none'
        }`}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
};

export default Message;
