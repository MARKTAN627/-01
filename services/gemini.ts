import { ImageResolution, Language } from "../types";

// The frontend now calls the Vercel API routes instead of Google directly.
// This keeps the API Key secure on the server.

export const generateMeditationScript = async (topic: string, language: Language): Promise<{ title: string; script: string; visualPrompt: string }> => {
  const response = await fetch('/api/generate-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, language }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate script');
  }

  return response.json();
};

export const generateMeditationImage = async (prompt: string, resolution: ImageResolution): Promise<string> => {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, resolution }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  const data = await response.json();
  return data.imageUrl;
};

export const generateNarration = async (text: string, language: Language): Promise<string> => {
  const response = await fetch('/api/generate-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate audio');
  }

  const data = await response.json();
  return data.audioBase64;
};

export const getChatResponse = async (history: {role: 'user' | 'model', text: string}[], newMessage: string, language: Language) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, newMessage, language }),
  });

  if (!response.ok) {
    throw new Error('Failed to get chat response');
  }

  const data = await response.json();
  return data.text;
};