import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, X, Volume2, Maximize2 } from 'lucide-react';
import { MeditationCourse, Language } from '../types';
import { decodeAudioData, decodeBase64 } from '../services/audioUtils';
import { getTranslation } from '../services/i18n';

interface PlayerProps {
  course: MeditationCourse;
  onClose: () => void;
  language: Language;
}

const MeditationPlayer: React.FC<PlayerProps> = ({ course, onClose, language }) => {
  const t = getTranslation(language);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const initAudio = async () => {
      if (!course.audioBase64) return;

      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = ctx;

        const rawBytes = decodeBase64(course.audioBase64);
        const buffer = await decodeAudioData(rawBytes, ctx, 24000, 1); // 24kHz Mono
        
        audioBufferRef.current = buffer;
        setDuration(buffer.duration);
        setIsReady(true);
      } catch (e) {
        console.error("Audio initialization failed", e);
      }
    };

    initAudio();

    return () => {
      stopAudio();
      audioContextRef.current?.close();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [course.audioBase64]);

  const playAudio = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    // Resume context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);

    // Calculate start time based on where we paused
    const offset = pauseTimeRef.current;
    startTimeRef.current = audioContextRef.current.currentTime - offset;
    
    source.start(0, offset);
    sourceNodeRef.current = source;
    
    source.onended = () => {
        // Only set playing to false if it ended naturally, not manually stopped
        // We can check currentTime vs duration, but simple toggle for now
        // This is tricky because stop() triggers onended too.
    };

    setIsPlaying(true);
    animateProgress();
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current && audioContextRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      sourceNodeRef.current = null;
      setIsPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) pauseAudio();
    else playAudio();
  };

  const animateProgress = () => {
    if (!audioContextRef.current) return;
    
    const now = audioContextRef.current.currentTime;
    const current = now - startTimeRef.current;
    
    if (current >= duration) {
       setIsPlaying(false);
       pauseTimeRef.current = 0;
       setCurrentTime(duration);
       return;
    }

    setCurrentTime(current);
    rafRef.current = requestAnimationFrame(animateProgress);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url(${course.imageUrl})`, opacity: 0.7 }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90"></div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center text-white/90">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-widest text-saffron-300">{t.meditationInProgress}</h2>
          <h1 className="text-2xl font-serif font-bold mt-1">{course.title}</h1>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-3xl space-y-8">
           <div className={`transition-all duration-1000 ${isPlaying ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <p className="text-lg md:text-xl text-saffron-50 leading-relaxed font-serif max-h-[40vh] overflow-y-auto p-4 scrollbar-hide bg-black/30 rounded-xl backdrop-blur-sm border border-white/10">
                {course.script}
              </p>
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 p-8 pb-12">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-white/70">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-saffron-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-center gap-8 pt-4">
             <button className="text-white/60 hover:text-white transition-colors">
               <Volume2 className="w-5 h-5" />
             </button>

             <button 
               onClick={togglePlay}
               disabled={!isReady}
               className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                 isReady 
                   ? 'bg-saffron-500 text-maroon-900 hover:bg-saffron-400 shadow-lg shadow-saffron-500/20' 
                   : 'bg-white/10 text-white/30'
               }`}
             >
               {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
             </button>

             <button className="text-white/60 hover:text-white transition-colors">
               <Maximize2 className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationPlayer;