import React, { useState } from 'react';
import { SavedNote } from '../types';
import { simplifyNotes } from '../services/aiService';
import { BookOpen, Inbox, Calendar, Sparkles, Heading, List, Bold, Archive } from 'lucide-react';

export const NotesSimplifier: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    const saved = localStorage.getItem('zen_saved_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSimplify = async () => {
    if (!notes.trim() || isSimplifying) return;
    setIsSimplifying(true);
    try {
      const simplified = await simplifyNotes(notes);
      setNotes(simplified);
    } catch (err) {
      console.error("Simplification failed", err);
    } finally {
      setIsSimplifying(false);
    }
  };

  const saveNote = () => {
    if (!notes.trim()) return;
    const newNote: SavedNote = {
      id: Date.now().toString(),
      title: title || `Note ${savedNotes.length + 1}`,
      original: notes,
      simplified: notes,
      date: new Date().toLocaleDateString()
    };
    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    localStorage.setItem('zen_saved_notes', JSON.stringify(updated));
    setNotes('');
    setTitle('');
  };

  const loadNote = (note: SavedNote) => {
    setNotes(note.original);
    setTitle(note.title);
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedNotes.filter(n => n.id !== id);
    setSavedNotes(updated);
    localStorage.setItem('zen_saved_notes', JSON.stringify(updated));
  };

  const formatNote = (type: 'bullets' | 'bold' | 'header') => {
    if (type === 'bullets') {
      const lines = notes.split('\n').map(line => line.startsWith('• ') ? line : `• ${line}`);
      setNotes(lines.join('\n'));
    } else if (type === 'bold') {
      setNotes(`**${notes}**`);
    } else if (type === 'header') {
      setNotes(`# ${notes}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
      <div className="lg:col-span-8 space-y-4">
        <div className="bento-card p-6 md:p-8 h-full flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tighter">Note Lab</h3>
              <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black tracking-wider uppercase">AI Assisted Repository</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => formatNote('header')} className="w-7 h-7 rounded-md bg-slate-100 dark:bg-surface-container text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-surface-bright transition-all font-bold text-xs"><Heading size={14}/></button>
              <button onClick={() => formatNote('bullets')} className="w-7 h-7 rounded-md bg-slate-100 dark:bg-surface-container text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-surface-bright transition-all font-bold text-xs"><List size={14}/></button>
              <button onClick={() => formatNote('bold')} className="w-7 h-7 rounded-md bg-slate-100 dark:bg-surface-container text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-surface-bright transition-all font-bold text-xs"><Bold size={14}/></button>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="group">
              <label className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 ml-1">Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Subject or Topic..."
                className="w-full bg-slate-50 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-slate-800 dark:text-white font-bold text-xs transition-all shadow-sm"
              />
            </div>

            <div className="group">
              <label className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 ml-1">Content</label>
              <textarea
                className="w-full h-44 bg-slate-50 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-xl p-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none text-slate-700 dark:text-slate-200 resize-none transition-all placeholder-slate-400 font-medium shadow-sm text-xs"
                placeholder="Write your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center pt-1.5 gap-3">
              <button
                onClick={handleSimplify}
                disabled={!notes.trim() || isSimplifying}
                className="flex-1 bg-slate-100 dark:bg-surface-container text-slate-800 dark:text-white px-4 h-[42px] rounded-lg font-bold tracking-wider text-[10px] hover:bg-slate-200 dark:hover:bg-surface-bright disabled:opacity-30 transition-all shadow-sm flex justify-center items-center gap-1.5 border border-slate-200 dark:border-outline-variant/10"
              >
                <Sparkles size={14} className={isSimplifying ? 'animate-spin' : ''}/> {isSimplifying ? 'Simplifying...' : 'AI Simplify'}
              </button>

              <button
                onClick={saveNote}
                disabled={!notes.trim()}
                className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 h-[42px] rounded-lg font-bold tracking-wider text-[10px] hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-30 transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Archive size={14}/> Archive Note
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 bento-card p-6 h-fit sticky top-6">
        <h3 className="font-black text-slate-800 dark:text-white mb-4.5 flex items-center gap-2 text-base tracking-tight">
          <span className="w-7 h-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md flex items-center justify-center"><BookOpen size={14}/></span>
          The Library
          <span className="ml-auto bg-slate-100 dark:bg-surface-container text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-outline-variant/10 text-[8px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase">{savedNotes.length} Files</span>
        </h3>
        {savedNotes.length === 0 ? (
          <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 dark:border-outline-variant/20 rounded-xl bg-slate-50/50 dark:bg-surface-container/30">
            <span className="mb-2 flex justify-center text-slate-300 dark:text-slate-600"><Inbox size={24}/></span>
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Empty Archive</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {savedNotes.map(note => (
              <div
                key={note.id}
                onClick={() => loadNote(note)}
                className="bg-white dark:bg-background p-3 rounded-lg border border-slate-100 dark:border-outline-variant/10 shadow-sm hover:shadow hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white text-xs line-clamp-1 transition-colors">{note.title}</h4>
                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
                      <Calendar size={10}/> {note.date}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 w-6 h-6 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 text-base font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};