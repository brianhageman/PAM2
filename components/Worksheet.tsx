import React from 'react';
import type { Worksheet } from '../types';
import { renderMessageWithKatex } from './Message';
import PrintIcon from './icons/PrintIcon';
import CloseIcon from './icons/CloseIcon';

interface WorksheetProps {
  worksheet: Worksheet;
  onClose: () => void;
}

const WorksheetComponent: React.FC<WorksheetProps> = ({ worksheet, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-worksheet fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="printable-worksheet-content bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full h-full flex flex-col">
        <header className="no-print flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-gray-100 truncate">{worksheet.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Print Worksheet"
            >
              <PrintIcon className="w-6 h-6 text-gray-300" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Close Worksheet"
            >
              <CloseIcon className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </header>
        
        <div className="flex-grow overflow-y-auto p-6 md:p-8 text-gray-200">
          <div className="worksheet-section">
            <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">{worksheet.title}</h2>
            <div className="space-y-6">
              {worksheet.questions.map(q => (
                <div key={q.questionNumber} className="flex gap-4 items-start">
                  <span className="font-bold text-lg text-cyan-400">{q.questionNumber}.</span>
                  <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                    {renderMessageWithKatex(q.questionText)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="answer-key-section mt-12 pt-8 border-t-2 border-dashed border-gray-600">
            <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">Answer Key</h2>
            <div className="space-y-4">
              {worksheet.answerKey.sort((a,b) => a.questionNumber - b.questionNumber).map(a => (
                <div key={a.questionNumber} className="flex gap-4 items-start">
                   <span className="font-bold text-lg text-cyan-400">{a.questionNumber}.</span>
                   <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                    {renderMessageWithKatex(a.answerText)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetComponent;
