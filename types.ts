export type RigorLevel = 'Middle School' | 'High School' | 'Undergraduate';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

// Define the shape of the KaTeX object that will be available on the window
interface Katex {
  renderToString(expression: string, options?: any): string;
}

declare global {
  interface Window {
    renderMathInElement: (element: HTMLElement, options?: any) => void;
    katex: Katex;
  }
}

export const LANGUAGES = [
  { name: 'English', code: 'English' },
  { name: 'Español', code: 'Spanish' },
  { name: 'Français', code: 'French' },
  { name: 'Deutsch', code: 'German' },
  { name: '中文 (简体)', code: 'Simplified Chinese' },
  { name: '日本語', code: 'Japanese' },
  { name: '한국어', code: 'Korean' },
  { name: 'Português', code: 'Portuguese' },
  { name: 'Русский', code: 'Russian' },
  { name: 'العربية', code: 'Arabic' },
  { name: 'हिन्दी', code: 'Hindi' },
  { name: 'Italiano', code: 'Italian' },
] as const;

export interface WorksheetQuestion {
  questionNumber: number;
  questionText: string;
}

export interface WorksheetAnswer {
  questionNumber: number;
  answerText: string;
}

export interface Worksheet {
  title: string;
  questions: WorksheetQuestion[];
  answerKey: WorksheetAnswer[];
}
