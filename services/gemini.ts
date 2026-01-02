import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ImageResolution, Language } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check key
const ensureKey = () => {
  if (!apiKey) throw new Error("API Key is missing from environment variables.");
};

export const generateMeditationScript = async (topic: string, language: Language): Promise<{ title: string; script: string; visualPrompt: string }> => {
  ensureKey();
  
  const langName = language === 'zh' ? 'Chinese (Simplified)' : language === 'sa' ? 'Sanskrit' : 'English';
  
  const prompt = `
    Create a guided meditation based on "The Great Treatise on the Stages of the Path to Enlightenment" (Lamrim Chenmo) by Tsongkhapa.
    The topic is: "${topic}".
    Language: ${langName}.
    
    The script should be deep, philosophical yet accessible, guiding the practitioner from their current state to a realization related to the topic.
    If the language is Sanskrit, ensure it is grammatically correct or use a high-register style suitable for chanting/recitation if appropriate, but keeping it understandable as a guided meditation.
    
    Also provide a prompt for a visual artist to generate a serene, Tibetan Buddhist style image (thangka or realistic nature) that matches the visualization part of the meditation.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          script: { type: Type.STRING, description: `The spoken text of the meditation in ${langName}. Approx 150-200 words.` },
          visualPrompt: { type: Type.STRING, description: "A detailed description for an image generator (always in English)." }
        },
        required: ["title", "script", "visualPrompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No script generated");
  return JSON.parse(text);
};

export const generateMeditationImage = async (prompt: string, resolution: ImageResolution): Promise<string> => {
  ensureKey();

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt + " style of Tibetan Thangka or serene Himalayan landscape, high quality, sacred geometry, golden hues, deep maroon." }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: resolution
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const generateNarration = async (text: string, language: Language): Promise<string> => {
  ensureKey();

  // For Sanskrit/Chinese, we might want different voices if available, but Fenrir/Puck usually handle multi-lingual input by approximating.
  // We'll stick to default configured voice but let the model handle the text language.
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Fenrir' }, 
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  
  return base64Audio;
};

export const getChatResponse = async (history: {role: 'user' | 'model', text: string}[], newMessage: string, language: Language) => {
  ensureKey();

  const langInstruction = language === 'zh' ? 'Answer in Chinese.' : language === 'sa' ? 'Answer in Sanskrit (or English with Sanskrit terms if complex explanation is needed).' : 'Answer in English.';

  // Construct chat history
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    })),
    config: {
      systemInstruction: `You are a wise Gelugpa master, expert in Tsongkhapa's Lamrim Chenmo. Answer questions with compassion, referring to the stages of the path (Small scope, Medium scope, Great scope). Keep answers concise but profound. ${langInstruction}`
    }
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "I remain in silent contemplation.";
};
