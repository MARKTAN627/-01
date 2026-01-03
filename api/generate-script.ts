import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { topic, language } = req.body;
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error: API Key missing" });
    }

    const ai = new GoogleGenAI({ apiKey });
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
    
    // The text is already a JSON string, so we send it directly with the correct content type
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(text);

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}