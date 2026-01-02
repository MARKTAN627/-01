import React, { useState } from 'react';
import { BookOpen, Flower2, MessageCircle, PlayCircle, PlusCircle, Globe } from 'lucide-react';
import Generator from './components/Generator';
import ChatInterface from './components/ChatInterface';
import MeditationPlayer from './components/MeditationPlayer';
import { AppState, MeditationCourse, Language } from './types';
import { getTranslation } from './services/i18n';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'home',
    courses: [],
    language: 'en'
  });

  const t = getTranslation(state.language);

  const handleCourseCreated = (course: MeditationCourse) => {
    setState(prev => ({
      ...prev,
      courses: [course, ...prev.courses],
      activeCourse: course,
      view: 'meditate'
    }));
  };

  const NavButton = ({ view, icon: Icon, label }: { view: AppState['view'], icon: React.ElementType, label: string }) => (
    <button
      onClick={() => setState(prev => ({ ...prev, view }))}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 ${
        state.view === view
          ? 'bg-maroon-700/80 text-white font-bold shadow-lg backdrop-blur-md'
          : 'text-maroon-900 hover:bg-white/40 hover:text-maroon-700 hover:shadow-sm'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  const LanguageSelector = () => (
    <div className="flex gap-1 p-1.5 bg-white/30 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
       <button 
         onClick={() => setState(prev => ({ ...prev, language: 'en' }))}
         className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${state.language === 'en' ? 'bg-maroon-700 text-white shadow-md' : 'text-maroon-900 hover:bg-white/30'}`}
       >
         EN
       </button>
       <button 
         onClick={() => setState(prev => ({ ...prev, language: 'zh' }))}
         className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${state.language === 'zh' ? 'bg-maroon-700 text-white shadow-md' : 'text-maroon-900 hover:bg-white/30'}`}
       >
         中文
       </button>
       <button 
         onClick={() => setState(prev => ({ ...prev, language: 'sa' }))}
         className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${state.language === 'sa' ? 'bg-maroon-700 text-white shadow-md' : 'text-maroon-900 hover:bg-white/30'}`}
       >
         सं
       </button>
    </div>
  );

  return (
    <div className="min-h-screen flex relative overflow-hidden font-sans text-gray-800">
      
      {/* Background Layer - Pure Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1544185292-623275727b40?q=80&w=2670&auto=format&fit=crop" 
          alt="Himalayan Background" 
          className="w-full h-full object-cover"
        />
        {/* Removed all overlays to ensure maximum visibility of the mountains */}
      </div>

      {/* Sidebar */}
      <aside className="relative z-20 w-72 bg-white/40 backdrop-blur-xl border-r border-white/20 p-6 flex-shrink-0 flex flex-col hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 mb-10 px-2">
          <div className="relative">
            <div className="absolute inset-0 bg-saffron-200 blur-lg opacity-40 rounded-full"></div>
            <img 
              src="https://okaiok-photo.imgix.net/AI_LOGO_04-removebg-preview.png" 
              alt="Logo" 
              className="relative w-16 h-16 object-contain drop-shadow-sm"
            />
          </div>
          <div>
            <h1 className="font-serif font-bold text-maroon-900 leading-tight text-lg whitespace-nowrap">{t.appTitle}</h1>
            <p className="text-xs font-medium text-maroon-800/90 uppercase tracking-wider">{t.appSubtitle}</p>
          </div>
        </div>

        <div className="mb-8">
          <LanguageSelector />
        </div>

        <nav className="space-y-3 flex-1">
          <NavButton view="home" icon={BookOpen} label={t.library} />
          <NavButton view="create" icon={PlusCircle} label={t.newPractice} />
          <NavButton view="chat" icon={MessageCircle} label={t.chat} />
        </nav>

        <div className="pt-6 border-t border-maroon-900/10">
          <div className="flex items-center justify-center gap-2 opacity-80">
             <Flower2 className="w-4 h-4 text-maroon-800" />
             <p className="text-[10px] font-bold text-maroon-900 uppercase tracking-widest">{t.inspiredBy}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/40 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-4 z-40 md:hidden shadow-sm">
          <div className="flex items-center gap-3">
             <img 
               src="https://okaiok-photo.imgix.net/AI_LOGO_04-removebg-preview.png" 
               alt="Logo" 
               className="w-10 h-10 object-contain"
             />
             <span className="font-serif font-bold text-maroon-900 whitespace-nowrap">{t.appTitle}</span>
          </div>
          <button 
            onClick={() => {
              const next = state.language === 'en' ? 'zh' : state.language === 'zh' ? 'sa' : 'en';
              setState(prev => ({ ...prev, language: next }));
            }}
            className="w-10 h-10 flex items-center justify-center bg-saffron-100/60 rounded-full text-maroon-900 font-bold text-xs border border-saffron-200/50 backdrop-blur-md shadow-sm"
          >
            {state.language.toUpperCase()}
          </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-12 mt-16 md:mt-0 scrollbar-thin">
        <div className="max-w-6xl mx-auto h-full">
          
          {state.view === 'home' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="mb-10 text-center md:text-left bg-white/30 p-8 rounded-2xl backdrop-blur-md border border-white/30 inline-block shadow-lg shadow-black/5">
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-maroon-900 mb-4 drop-shadow-sm">{t.welcome}</h2>
                  <p className="text-lg text-maroon-900 font-medium max-w-2xl">{t.welcomeSub}</p>
                </header>

                {state.courses.length === 0 ? (
                  <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-16 text-center border border-white/30 shadow-2xl shadow-black/5 max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-saffron-100/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white/50">
                       <Flower2 className="w-10 h-10 text-maroon-700" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-maroon-900 mb-3">{t.noMeditations}</h3>
                    <p className="text-maroon-900/80 mb-8 leading-relaxed font-semibold">{t.createFirst}</p>
                    <button 
                      onClick={() => setState(prev => ({...prev, view: 'create'}))}
                      className="px-8 py-3 bg-gradient-to-r from-maroon-800 to-maroon-700 text-white rounded-full font-medium shadow-lg shadow-maroon-900/30 hover:shadow-xl hover:scale-105 transition-all duration-300 ring-2 ring-white/20"
                    >
                      {t.beginPractice}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {state.courses.map((course, idx) => (
                      <div 
                        key={idx} 
                        className="group bg-white/40 backdrop-blur-md rounded-2xl shadow-lg shadow-black/5 border border-white/40 overflow-hidden hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer" 
                        onClick={() => setState(prev => ({...prev, activeCourse: course, view: 'meditate'}))}
                      >
                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                          {course.imageUrl && (
                            <img 
                              src={course.imageUrl} 
                              alt={course.topic} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:bg-saffron-500 group-hover:text-white group-hover:border-saffron-400 transition-colors duration-300">
                                <PlayCircle className="w-6 h-6 text-white" />
                             </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 rounded-md bg-saffron-100/50 border border-saffron-200/50 text-[10px] font-bold text-maroon-800 uppercase tracking-wider">Guided</span>
                            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">{course.durationStr}</span>
                          </div>
                          <h3 className="font-serif font-bold text-gray-900 text-xl mb-3 line-clamp-1 group-hover:text-maroon-900 transition-colors">{course.title}</h3>
                          <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed font-medium">{course.script}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          )}

          {state.view === 'create' && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
              <Generator onCourseCreated={handleCourseCreated} language={state.language} />
            </div>
          )}

          {state.view === 'chat' && (
            <div className="animate-in fade-in duration-700 h-full">
              <ChatInterface language={state.language} />
            </div>
          )}

        </div>
      </main>

      {/* Full Screen Player Overlay */}
      {state.view === 'meditate' && state.activeCourse && (
        <MeditationPlayer 
          course={state.activeCourse} 
          onClose={() => setState(prev => ({ ...prev, view: 'home' }))} 
          language={state.language}
        />
      )}

      {/* Mobile Navigation Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/50 backdrop-blur-xl border-t border-white/30 flex justify-around p-3 z-40 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setState(prev => ({ ...prev, view: 'home' }))} className={`p-2 rounded-xl transition-all ${state.view === 'home' ? 'text-maroon-800 bg-white/50 shadow-sm' : 'text-gray-600'}`}><BookOpen className="w-6 h-6" /></button>
        <button onClick={() => setState(prev => ({ ...prev, view: 'create' }))} className={`p-2 rounded-xl transition-all ${state.view === 'create' ? 'text-maroon-800 bg-white/50 shadow-sm' : 'text-gray-600'}`}><PlusCircle className="w-6 h-6" /></button>
        <button onClick={() => setState(prev => ({ ...prev, view: 'chat' }))} className={`p-2 rounded-xl transition-all ${state.view === 'chat' ? 'text-maroon-800 bg-white/50 shadow-sm' : 'text-gray-600'}`}><MessageCircle className="w-6 h-6" /></button>
      </div>

    </div>
  );
};

export default App;