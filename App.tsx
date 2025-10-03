import React, { useState, useCallback } from 'react';
import { type Message, type RigorLevel, type Worksheet } from './types';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import RigorSelection from './components/RigorSelection';
import LanguageSelection from './components/LanguageSelection';
import WorksheetComponent from './components/Worksheet';
import { createChat, generateWorksheet, validateApiKey, extractTopics } from './services/geminiService';
import type { Chat } from '@google/genai';
import RocketIcon from './components/icons/RocketIcon';
import WorksheetIcon from './components/icons/WorksheetIcon';

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rigorLevel, setRigorLevel] = useState<RigorLevel | null>(null);
  const [language, setLanguage] = useState<string | null>(null);

  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState<boolean>(false);
  const [showWorksheet, setShowWorksheet] = useState<boolean>(false);
  const [worksheetError, setWorksheetError] = useState<string | null>(null);

  const initializeChat = useCallback(async (level: RigorLevel, lang: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const chatSession = createChat(level, lang);
      setChat(chatSession);

      const responseStream = await chatSession.sendMessageStream({ message: "Introduce yourself." });
      
      let aiResponse = '';
      const aiMessageId = Date.now().toString();

      setMessages([{ id: aiMessageId, text: '', sender: 'ai' }]);
      
      for await (const chunk of responseStream) {
        aiResponse += chunk.text;
        setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: aiResponse} : m));
      }
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('API rate limit exceeded. Please wait a moment and refresh the page.');
      } else {
        setError('Failed to initialize chat. Please check your API key and network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!chat) return;

    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setWorksheetError(null);

    try {
      const responseStream = await chat.sendMessageStream({ message: text });
      
      let aiResponse = '';
      const aiMessageId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);
      
      for await (const chunk of responseStream) {
        aiResponse += chunk.text;
        setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: aiResponse} : m));
      }

    } catch (e: any) {
      console.error(e);
      let errorMessage = e.message || 'Sorry, I encountered an error. Please try again.';
      if (e?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = 'API rate limit exceeded. Please wait a moment before sending another message.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWorksheet = async () => {
    if (!rigorLevel || !language || messages.length < 2) return;
    
    setIsGeneratingWorksheet(true);
    setWorksheetError(null);
    try {
      // Step 1: Extract topics from the conversation.
      const topics = await extractTopics(messages, rigorLevel, language);

      // Step 2: Generate the worksheet using the extracted topics.
      if (topics && topics.length > 0) {
        const generatedWorksheet = await generateWorksheet(topics, rigorLevel, language);
        setWorksheet(generatedWorksheet);
        setShowWorksheet(true);
      } else {
        // Handle case where no topics could be extracted
        setWorksheetError("Could not identify specific topics from the conversation to generate a worksheet. Please discuss a topic first.");
      }
    } catch (e: any) {
      console.error("Failed to generate worksheet:", e);
      const errorMessage = e.message || "Sorry, I couldn't generate a worksheet. Please try again later.";
      setWorksheetError(`Failed to generate worksheet: ${errorMessage}`);
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  const handleRigorSelect = (level: RigorLevel) => {
    setRigorLevel(level);
  };

  const handleLanguageSelect = async (langCode: string) => {
    if (!rigorLevel) return;

    setIsLoading(true);
    setError(null);
    setLanguage(langCode);

    try {
      const validation = await validateApiKey();
      if (!validation.isValid) {
        setError(`API connection failed: ${validation.error}. Please check your API key, billing status, and network connection, then refresh the page to try again.`);
        setIsLoading(false);
        setLanguage(null); // Reset language selection on failure
        return;
      }
      await initializeChat(rigorLevel, langCode);
    } catch(e: any) {
      console.error("Error during language selection and chat initialization:", e);
      setError(e.message || "An unexpected error occurred during setup.");
      setIsLoading(false);
      setLanguage(null);
    }
  };
  
  const handleReset = () => {
    setRigorLevel(null);
    setLanguage(null);
    setMessages([]);
    setChat(null);
    setError(null);
    setWorksheet(null);
    setShowWorksheet(false);
    setWorksheetError(null);
  };

  const header = (
    <header className="flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 shadow-lg z-10 flex-shrink-0">
      <div className="flex items-center">
        <RocketIcon className="w-8 h-8 text-cyan-400 mr-3"/>
        <h1 className="text-xl font-bold text-gray-100">
          <span className="hidden sm:inline">Physicus Aurelius Maximus</span>
          <span className="sm:hidden">P.A.M.</span>
        </h1>
      </div>
      {(rigorLevel && language) && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateWorksheet}
            disabled={isLoading || isGeneratingWorksheet || messages.length < 2}
            className="px-3 py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-600 transition-colors flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
            aria-label="Generate practice worksheet"
          >
            {isGeneratingWorksheet ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <WorksheetIcon className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Worksheet</span>
          </button>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
          >
            Start Over
          </button>
        </div>
      )}
    </header>
  );
  
  const renderContent = () => {
    if (!rigorLevel) {
      return (
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <RigorSelection onSelect={handleRigorSelect} />
        </main>
      );
    }
    if (!language) {
      return (
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <LanguageSelection onSelect={handleLanguageSelect} />
        </main>
      );
    }
    return (
      <main className="flex-grow flex flex-col min-h-0 w-full">
        <ChatWindow messages={messages} isLoading={isLoading && messages.length > 0} />
        {(error || worksheetError) && !isLoading && (
          <div className="px-4 pb-2 text-center text-red-400">
            <p>{error || worksheetError}</p>
          </div>
        )}
        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading || isGeneratingWorksheet} />
      </main>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      {header}
      {renderContent()}
      {showWorksheet && worksheet && (
        <WorksheetComponent 
          worksheet={worksheet} 
          onClose={() => setShowWorksheet(false)}
        />
      )}
    </div>
  );
};

export default App;
