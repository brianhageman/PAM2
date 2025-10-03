import React from 'react';
import { RigorLevel } from '../types';

interface RigorSelectionProps {
  onSelect: (level: RigorLevel) => void;
}

const RigorSelection: React.FC<RigorSelectionProps> = ({ onSelect }) => {
  const levels: RigorLevel[] = ['Middle School', 'High School', 'Undergraduate'];

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center max-w-md w-full animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 text-gray-100">Welcome to Physicus Aurelius Maximus</h2>
      <p className="text-gray-400 mb-6">To get started, please select your current physics level.</p>
      <div className="flex flex-col space-y-4">
        {levels.map(level => (
          <button
            key={level}
            onClick={() => onSelect(level)}
            className="w-full p-4 bg-cyan-500 text-white rounded-lg font-semibold text-lg hover:bg-cyan-600 active:bg-cyan-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400"
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RigorSelection;