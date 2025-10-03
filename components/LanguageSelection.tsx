import React from 'react';
import { LANGUAGES } from '../types';

interface LanguageSelectionProps {
  onSelect: (languageCode: string) => void;
}

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onSelect }) => {
  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center max-w-lg w-full animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 text-gray-100">Select Language</h2>
      <p className="text-gray-400 mb-6">Please choose the language for your session.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className="p-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 active:bg-cyan-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400"
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelection;
