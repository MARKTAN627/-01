import React, { useState } from 'react';
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ImageResolution, MeditationCourse, Language } from '../types';
import { generateMeditationScript, generateMeditationImage, generateNarration } from '../services/gemini';
import { getTranslation } from '../services/i18n';

interface GeneratorProps {
  onCourseCreated: (course: MeditationCourse) => void;
  language: Language;
}

const Generator: React.FC<GeneratorProps> = ({ onCourseCreated, language }) => {
  const [topic, setTopic] = useState('');
  const [resolution, setResolution] = useState<ImageResolution>(ImageResolution._1K);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  
  const t = getTranslation(language);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    
    try {
      setStatus(t.generatingScript);
      const { title, script, visualPrompt } = await generateMeditationScript(topic, language);
      
      setStatus(t.generatingImage);
      const imageUrl = await generateMeditationImage(visualPrompt, resolution);
      
      setStatus(t.generatingAudio);
      const audioBase64 = await generateNarration(script, language);

      const newCourse: MeditationCourse = {
        title,
        topic,
        script,
        visualPrompt,
        imageUrl,
        audioBase64,
        durationStr: "Guided",
        language
      };

      onCourseCreated(newCourse);
    } catch (error: any) {
      console.error(error);
      // Check if the error is related to missing API Key
      if (error.message && error.message.includes("API Key is missing")) {
        alert("API Key is missing. Please create a .env file with API_KEY=your_key_here or configure it in your deployment settings.");
      } else {
        alert(t.error);
      }
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="inline-block p-3 rounded-full bg-white/40 backdrop-blur-md border border-white/50 mb-4 shadow-sm">
          <Sparkles className="w-6 h-6 text-maroon-600" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-maroon-900 mb-3 drop-shadow-sm">{t.beginPractice}</h2>
        <p className="text-gray-700 font-medium">{t.createFirst}</p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-maroon-900/10 p-8 md:p-10 border border-white/60 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-saffron-100/50 to-transparent rounded-bl-full -z-10 blur-2xl"></div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-maroon-900 uppercase tracking-wider mb-3 ml-1">{t.meditationTopic}</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t.topicPlaceholder}
              className="w-full px-5 py-4 rounded-xl bg-white/50 border border-gray-200/60 focus:ring-4 focus:ring-maroon-500/10 focus:border-maroon-500 outline-none transition-all placeholder:text-gray-400 font-medium text-lg shadow-inner"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon-900 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {t.visualQuality}
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(Object.values(ImageResolution) as ImageResolution[]).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`py-3 px-4 rounded-xl border font-semibold transition-all shadow-sm ${
                    resolution === res
                      ? 'bg-maroon-50 border-maroon-500 text-maroon-800 ring-1 ring-maroon-500 shadow-md'
                      : 'bg-white/50 border-gray-200/60 text-gray-500 hover:bg-white hover:border-maroon-200 hover:text-maroon-700'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
              isGenerating || !topic
                ? 'bg-gray-400 cursor-not-allowed shadow-none hover:translate-y-0'
                : 'bg-gradient-to-r from-maroon-800 to-maroon-600 hover:from-maroon-900 hover:to-maroon-700 shadow-maroon-900/20'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {status}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {t.generate}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Generator;