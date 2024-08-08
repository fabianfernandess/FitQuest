import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';

// Initialize the GoogleGenerativeAI instance
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const sendMessageToGemini = async (messages) => {
  try {
    console.log('Sending request to Gemini API...');
    const prompt = messages.map(msg => msg.content).join('\n');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log(text);
    return { choices: [{ message: { content: text } }] };
  } catch (error) {
    console.error('Error communicating with Gemini API:', error);
    throw error;
  }
};
