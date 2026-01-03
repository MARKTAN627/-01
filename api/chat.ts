import { GoogleGenAI } from "@google/genai";

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { history, newMessage, language } = await request.json();
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server configuration error: API Key missing" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenAI({ apiKey });
    const langInstruction = language === 'zh' ? 'Answer in Chinese.' : language === 'sa' ? 'Answer in Sanskrit (or English with Sanskrit terms if complex explanation is needed).' : 'Answer in English.';

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history.map((h: any) => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      config: {
        systemInstruction: `You are a wise Gelugpa master, expert in Tsongkhapa's Lamrim Chenmo. Answer questions with compassion, referring to the stages of the path (Small scope, Medium scope, Great scope). Keep answers concise but profound. ${langInstruction}`
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    const text = result.text || "I remain in silent contemplation.";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}