import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { uploadProfileImage } from '../services/db';

interface StudentIdentityCardProps {
  user: UserProfile;
  onUpdateProfile: (updatedUser: UserProfile) => void;
  onEditProfileClick: () => void;
}

export const StudentIdentityCard: React.FC<StudentIdentityCardProps> = ({
  user,
  onUpdateProfile,
  onEditProfileClick,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback defaults
  const studentName = user.name || 'Student';
  const course = user.course || 'Cyber Security';
  const semester = user.semester || 'Semester 4';
  const university = user.university || 'ZenITH Institute';
  
  // Real Statistics generated automatically
  const studyStreak = user.studyStreak || 0;
  const sessionsCompleted = user.studySessionsCompleted || 0;
  const totalHours = user.totalStudyHours !== undefined ? user.totalStudyHours : Math.round((user.totalStudyTime || 0) / 60);
  const achievementsCount = user.achievements?.length || 0;
  
  // Goal completion rate: (total study time today / study goal) OR default
  const goalCompletionRate = user.goalCompletionRate || 0;

  // Academic status calculation
  const getAcademicStatus = () => {
    const burnout = user.burnoutRiskScore || 0;
    if (burnout > 70) return 'At Risk ⚠️';
    if (studyStreak > 5) return 'Focused ⚡';
    if (user.stressLevel && user.stressLevel > 7) return 'Stressed 😰';
    return 'Optimal 🧘';
  };

  // Rank Calculation
  const getRank = (hours: number): string => {
    if (hours < 5) return 'Beginner';
    if (hours < 15) return 'Scholar';
    if (hours < 30) return 'Achiever';
    if (hours < 60) return 'Expert';
    if (hours < 100) return 'Master';
    return 'Legend';
  };

  const currentRank = getRank(totalHours);

  // Helper to extract initials
  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'ST';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        onUpdateProfile({
          ...user,
          avatar: downloadUrl,
        });
      } catch (err) {
        console.error('Error uploading avatar:', err);
        setUploadError('Failed to upload image.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const isUrl = (str: string) => str && (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image/'));

  return (
    <div 
      className="relative overflow-hidden text-white w-full max-w-[280px] bg-slate-900/60 dark:bg-slate-950/40 backdrop-blur-md 
                 border border-white/10 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col transition-all duration-300"
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Edit Profile Button (Allowed Fields Only) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onEditProfileClick(); }}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg p-1.5 transition-all"
        title="Edit Profile Info"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      {/* Identity Card Header: Picture & Student Profile */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="relative group/avatar">
          <div 
            onClick={handleAvatarClick}
            className="rounded-full bg-slate-800/50 dark:bg-slate-950/40 border border-white/20
                       h-14 w-14 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 group-hover/avatar:border-white/50"
          >
            {isUrl(user.avatar) ? (
              <img 
                src={user.avatar} 
                alt={studentName} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover/avatar:scale-105" 
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-indigo-500 to-purple-500">
                <svg className="w-6 h-6 opacity-30 text-indigo-150" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                  <path d="M5 13.18v4l7 3.82 7-3.82v-4L12 17l-7-3.82z"/>
                </svg>
                <span className="absolute text-xs font-black tracking-tighter text-white select-none">
                  {getInitials(studentName)}
                </span>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <h4 className="font-black text-sm tracking-tight truncate leading-tight">{studentName}</h4>
          <p className="text-[10px] font-semibold text-indigo-200/90 truncate leading-none mt-1">{course}</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{semester}</p>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[8px] font-bold text-indigo-300 uppercase tracking-wider">Status:</span>
            <span className="text-[8px] font-black text-white px-1.5 py-0.5 rounded bg-white/10 border border-white/5">{getAcademicStatus()}</span>
          </div>
        </div>
      </div>

      {/* Identity Card Body: Auto-generated stats */}
      <div className="py-4 space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-350 font-bold">🔥 Current Streak</span>
          <span className="font-mono font-black text-amber-300">{studyStreak} Days</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-350 font-bold">📚 Sessions Completed</span>
          <span className="font-mono font-black">{sessionsCompleted}</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-350 font-bold">⏱ Total Study Hours</span>
          <span className="font-mono font-black">{totalHours.toFixed(1)}h</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-350 font-bold">🏆 Achievements Earned</span>
          <span className="font-mono font-black">{achievementsCount}</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-350 font-bold">🎯 Goal Completion Rate</span>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, goalCompletionRate)}%` }}
              ></div>
            </div>
            <span className="font-mono font-black text-[10px]">{Math.round(goalCompletionRate)}%</span>
          </div>
        </div>
      </div>

      {/* Identity Card Footer: Rank */}
      <div className="pt-3.5 border-t border-white/10 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
        <span>Academic Rank</span>
        <span className="text-indigo-300 font-black text-xs normal-case">{currentRank}</span>
      </div>

      {/* Upload Error display */}
      {uploadError && (
        <div className="absolute bottom-2 left-5 right-5 bg-red-600 text-[8px] font-bold uppercase py-0.5 rounded text-white tracking-wide text-center animate-bounce">
          {uploadError}
        </div>
      )}
    </div>
  );
};
