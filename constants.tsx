import React from 'react';

export const symptoms = [
  { 
    category: "Physical", 
    items: ["Headaches or migraines", "Muscle tension", "Sleep disturbances", "Appetite changes", "Rapid heartbeat"] 
  },
  { 
    category: "Emotional", 
    items: ["Irritability", "Feeling overwhelmed", "Panic attacks", "Low mood", "Loss of interest in hobbies"] 
  },
  { 
    category: "Cognitive", 
    items: ["Difficulty concentrating", "Racing thoughts", "Memory blanks", "Negative self-talk", "Constant worrying"] 
  }
];

export const diagnosticQuestions = [
  {
    id: 1,
    text: "How has your sleep been in the last 3 days?",
    options: [
      { text: "Solid & Refreshing 😴", score: 0, category: 'Physical' },
      { text: "Trouble falling asleep 🥱", score: 2, category: 'Physical' },
      { text: "Waking up exhausted 😫", score: 3, category: 'Physical' },
      { text: "Complete Insomnia 🐼", score: 5, category: 'Physical' }
    ]
  },
  {
    id: 2,
    text: "When you sit down to study, what happens?",
    options: [
      { text: "I get in the zone 🚀", score: 0, category: 'Cognitive' },
      { text: "I get distracted easily 📱", score: 2, category: 'Cognitive' },
      { text: "My mind goes blank 🌫️", score: 3, category: 'Cognitive' },
      { text: "I panic and can't start 💥", score: 5, category: 'Emotional' }
    ]
  },
  {
    id: 3,
    text: "How does your body feel right now?",
    options: [
      { text: "Relaxed 🧘", score: 0, category: 'Physical' },
      { text: "Shoulders/Neck are tight 🧱", score: 2, category: 'Physical' },
      { text: "Stomach is turning 🤢", score: 3, category: 'Physical' },
      { text: "Heart is racing ❤️‍🔥", score: 4, category: 'Physical' }
    ]
  },
  {
    id: 4,
    text: "What is your dominant emotion regarding exams?",
    options: [
      { text: "Confident / Ready 😎", score: 0, category: 'Emotional' },
      { text: "Annoyed / Irritable 😠", score: 2, category: 'Emotional' },
      { text: "Worried / Anxious 😟", score: 3, category: 'Emotional' },
      { text: "Hopeless / Overwhelmed 🏳️", score: 5, category: 'Emotional' }
    ]
  },
  {
    id: 5,
    text: "Are you experiencing 'Racing Thoughts'?",
    options: [
      { text: "No, mind is clear ✨", score: 0, category: 'Cognitive' },
      { text: "Sometimes at night 🌙", score: 2, category: 'Cognitive' },
      { text: "Often, hard to stop 🛑", score: 3, category: 'Cognitive' },
      { text: "Constant noise in head 📢", score: 5, category: 'Cognitive' }
    ]
  }
];

export const stressData = [
  { name: 'Low Stress', performance: 40 },
  { name: 'Optimal Stress', performance: 95 },
  { name: 'High Stress', performance: 30 },
  { name: 'Burnout', performance: 10 },
];

export const strategies = [
  {
    id: 'pomodoro',
    title: 'The Pomodoro Technique',
    description: 'Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer break. This prevents fatigue and maintains high focus.',
    color: 'bg-red-50 text-red-700 border-red-200'
  },
  {
    id: 'active',
    title: 'Active Recall',
    description: 'Instead of re-reading notes, test yourself. Close the book and try to remember what you just read. This strengthens neural connections.',
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'sleep',
    title: 'Sleep Hygiene',
    description: 'Aim for 7-9 hours. Sleep is when your brain consolidates memory. Pulling all-nighters actually reduces your ability to recall information.',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
];

export const resources = [
  {
    name: 'Forest App',
    desc: 'Gamify your focus by planting virtual trees while you study.',
    type: 'App'
  },
  {
    name: 'Khan Academy',
    desc: 'Free, world-class education for anyone, anywhere.',
    type: 'Resource'
  },
  {
    name: 'Student Support Services',
    desc: 'Reach out to your university or school counseling services.',
    type: 'Support'
  },
  {
    name: 'Pomofocus',
    desc: 'A simple, customizable Pomodoro timer for your browser.',
    type: 'Tool'
  }
];