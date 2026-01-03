import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { prompt, resolution } = req.body;
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error: API Key missing" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt + " style of Tibetan Thangka or serene Himalayan landscape, high quality, sacred geometry, golden hues, deep maroon." }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: resolution // 1K, 2K, 4K
        }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) throw new Error("No image generated");

    return res.status(200).json({ imageUrl });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}