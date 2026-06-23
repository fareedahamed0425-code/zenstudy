import React, { useState } from 'react';
import { UserProfile } from '../types';
import { uploadProfileImage } from '../services/db';

interface ProfileEditorProps {
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
  onCancel: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [course, setCourse] = useState(user.course || user.major || 'Cyber Security');
  const [semester, setSemester] = useState(user.semester || 'Semester 4');
  const [university, setUniversity] = useState(user.university || 'ZenITH Institute');
  const [dailyStudyGoal, setDailyStudyGoal] = useState(user.dailyStudyGoal !== undefined ? user.dailyStudyGoal : 2);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Support JPG, PNG, WEBP.');
        return;
      }

      setIsUploading(true);
      setUploadError('');
      try {
        const downloadUrl = await uploadProfileImage(user.id, file);
        setAvatar(downloadUrl);
      } catch (err) {
        setUploadError("Failed to upload image.");
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = () => {
    onSave({ 
      ...user, 
      name: name.trim(), 
      avatar, 
      course: course.trim(),
      semester,
      university: university.trim(),
      dailyStudyGoal: Number(dailyStudyGoal)
    });
  };

  const isUrl = (str: string) => str && (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image/'));

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'ST';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-800 animate-slide-up max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">Edit Profile</h2>
        
        <div className="space-y-5">
          {/* Avatar Upload Container */}
          <div className="flex flex-col items-center mb-2">
            <div className="relative w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
              {isUrl(avatar) ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-indigo-500/25 to-purple-500/25">
                  <svg className="w-8 h-8 opacity-25 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                    <path d="M5 13.18v4l7 3.82 7-3.82v-4L12 17l-7-3.82z"/>
                  </svg>
                  <span className="absolute text-sm font-black tracking-tighter text-indigo-700 dark:text-indigo-300">
                    {getInitials(name)}
                  </span>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <label className="mt-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-350 transition-all select-none">
              <span>📸 Change Photo</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
            </label>
            {uploadError && <p className="text-red-500 text-[9px] font-black uppercase tracking-wider mt-1">{uploadError}</p>}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium text-sm"
              required
            />
          </div>

          {/* University Field */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">University / College</label>
            <input 
              type="text" 
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium text-sm"
            />
          </div>

          {/* Major / Course and Semester Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Course / Major</label>
              <input 
                type="text" 
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium text-sm"
              >
                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Daily Study Goal Field */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Daily Study Goal (Hours)</label>
            <input 
              type="number" 
              min="1"
              max="24"
              value={dailyStudyGoal}
              onChange={(e) => setDailyStudyGoal(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium font-mono text-sm"
            />
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={onCancel} 
              className="flex-1 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-xs"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={isUploading || !name.trim()} 
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 text-xs"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
