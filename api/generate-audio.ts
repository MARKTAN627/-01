import { GoogleGenAI, Modality } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { text, language } = req.body;
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error: API Key missing" });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioBase64) throw new Error("No audio generated");

    return res.status(200).json({ audioBase64 });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}