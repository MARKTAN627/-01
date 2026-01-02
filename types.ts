export enum ImageResolution {
  _1K = '1K',
  _2K = '2K',
  _4K = '4K'
}

export type Language = 'en' | 'zh' | 'sa';

export interface MeditationCourse {
  title: string;
  topic: string;
  script: string;
  visualPrompt: string;
  imageUrl?: string;
  audioBase64?: string; // Raw PCM base64
  durationStr: string;
  language: Language;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AppState {
  view: 'home' | 'create' | 'meditate' | 'chat';
  activeCourse?: MeditationCourse;
  courses: MeditationCourse[];
  language: Language;
}