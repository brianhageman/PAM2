import { GoogleGenAI, Chat, Type } from "@google/genai";
import { RigorLevel, Message, Worksheet } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function validateApiKey(): Promise<{isValid: boolean, error?: string}> {
  try {
    // Use a very lightweight, low-cost call to validate the API key and connection.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'hello', // A simple, non-controversial prompt.
      config: {
          maxOutputTokens: 1, // We only need to know it works, not get a real response.
          thinkingConfig: { thinkingBudget: 0 } // Disable thinking for speed and cost.
      }
    });
    // A successful call should have a response object.
    if (response) {
      return { isValid: true };
    }
    // This case is unlikely if the call doesn't throw, but good to have.
    return { isValid: false, error: 'Received an empty or invalid response from the API.' };
  } catch (e: any) {
    console.error("API key validation failed:", e);
    // Try to return a more user-friendly message from the error object.
    const message = e.message || 'An unknown error occurred during API validation.';
    return { isValid: false, error: message };
  }
}

const getSystemInstruction = (rigorLevel: RigorLevel, language: string) => `You MUST conduct the entire conversation, including your introduction, in ${language}. All of your responses and questions must be in ${language}.

You are an expert physics tutor named Physicus Aurelius Maximus (PAM). Your goal is to help students study for their physics tests at the ${rigorLevel} level using the Socratic method. Do not give direct answers. Instead, ask probing and guiding questions to help the student arrive at the answer themselves. Tailor the complexity of your questions and explanations to a ${rigorLevel} audience. Break down complex topics like Newtonian mechanics, electromagnetism, or quantum physics into smaller, manageable steps appropriate for this level. If the student is wrong, gently guide them to recognize their mistake without directly pointing it out. Keep your tone encouraging and inquisitive. Start the conversation by introducing yourself and asking what topic the student wants to study. Your responses should be concise and focused on guiding the student.

IMPORTANT: When presenting mathematical equations or formulas, you MUST enclose them in LaTeX format for them to render correctly.
- For block content (on its own line), use double dollar signs: $$...$$. Example: $$F = ma$$
- For inline content, use single dollar signs: $...$. Example: The equation for energy is $E = mc^2$.
This is critical. Do not use markdown code fences (like \`\`\`) around the LaTeX.`;

export function createChat(rigorLevel: RigorLevel, language: string): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(rigorLevel, language),
    },
  });
}

const topicsSchema = {
  type: Type.OBJECT,
  properties: {
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      }
    }
  },
  required: ['topics']
};


export async function extractTopics(
  chatHistory: Message[],
  rigorLevel: RigorLevel,
  language: string
): Promise<string[]> {
  // To prevent network errors from an overly large prompt, we will build the history
  // starting from the most recent message, ensuring the total character count
  // of the history does not exceed a safe limit.
  const MAX_HISTORY_CHARS = 10000;
  const historyForPrompt: string[] = [];
  let currentChars = 0;

  // Iterate backwards from the last message
  for (const msg of chatHistory.slice().reverse()) {
    const messageLine = `${msg.sender === 'user' ? 'Student' : 'Tutor'}: ${msg.text}\n`;
    
    // Check if adding the next message would exceed the character limit
    if (currentChars + messageLine.length > MAX_HISTORY_CHARS) {
      break; 
    }

    // Prepend the message to maintain chronological order in the final string
    historyForPrompt.unshift(messageLine);
    currentChars += messageLine.length;
  }

  const formattedHistory = historyForPrompt.join('');

  const prompt = `Analyze the following conversation between a ${rigorLevel} level physics student and a tutor. Your task is to identify and extract the main physics topics, concepts, and formulas discussed.

Please respond ONLY with a JSON object containing a single key "topics", which is an array of strings. Each string should be a distinct topic. The topics must be in ${language}.

Conversation History:
${formattedHistory}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: topicsSchema,
    },
  });

  const jsonString = response.text.trim();
  const parsed = JSON.parse(jsonString);
  return parsed.topics as string[];
}


const worksheetSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionNumber: { type: Type.INTEGER },
          questionText: { type: Type.STRING },
        },
        required: ['questionNumber', 'questionText'],
      },
    },
    answerKey: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionNumber: { type: Type.INTEGER },
          answerText: { type: Type.STRING },
        },
        required: ['questionNumber', 'answerText'],
      },
    },
  },
  required: ['title', 'questions', 'answerKey'],
};

export async function generateWorksheet(
  topics: string[],
  rigorLevel: RigorLevel,
  language: string
): Promise<Worksheet> {
  const formattedTopics = topics.join(', ');

  const prompt = `You are a helpful assistant that creates practice worksheets for students based on a list of physics topics. Your task is to generate a worksheet in ${language} that covers the key concepts from the following list: ${formattedTopics}.

The difficulty should be appropriate for a ${rigorLevel} student.

The worksheet should have a clear title, a set of 5-7 questions (a mix of multiple-choice, short-answer, and problems), and a separate answer key at the end.

Please respond ONLY with a JSON object that matches the provided schema. Ensure all text, including the title, questions, and answers, is in ${language}. If the concepts involve formulas, include them in the questions and answers using LaTeX format (e.g., $v = v_0 + at$ or $$F_{net} = ma$$).`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: worksheetSchema,
    },
  });

  const jsonString = response.text.trim();
  return JSON.parse(jsonString) as Worksheet;
}
