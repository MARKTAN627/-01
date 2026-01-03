import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { history, newMessage, language } = req.body;
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error: API Key missing" });
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

    return res.status(200).json({ text });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}