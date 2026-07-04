'use client';

import { Roadmap } from './Roadmap';
import type { RoadmapItem } from './types';

// Simple emoji/text icons here so the demo has no external icon dependency.
// In your app, swap these for e.g. lucide-react icons.
const roadmapItems: RoadmapItem[] = [
  {
    id: 'basics',
    title: 'Basics',
    description: 'Variables, types & control flow',
    icon: <span>🌱</span>,
    color: '#22c55e',
    completed: true,
    locked: false,
    current: false,
    lessons: 8,
    duration: '2h',
  },
  {
    id: 'functions',
    title: 'Functions',
    description: 'Reusable blocks of logic',
    icon: <span>🧩</span>,
    color: '#22c55e',
    completed: true,
    locked: false,
    current: false,
    lessons: 6,
    duration: '1.5h',
  },
  {
    id: 'async',
    title: 'Async JS',
    description: 'Promises, async/await',
    icon: <span>⚡</span>,
    color: '#6366f1',
    completed: false,
    locked: false,
    current: true,
    lessons: 10,
    duration: '3h',
  },
  {
    id: 'react-basics',
    title: 'React Basics',
    description: 'Components & props',
    icon: <span>⚛️</span>,
    color: '#0ea5e9',
    completed: false,
    locked: true,
    current: false,
    lessons: 9,
    duration: '2.5h',
  },
  {
    id: 'state',
    title: 'State & Hooks',
    description: 'useState, useEffect and friends',
    icon: <span>🎛️</span>,
    color: '#0ea5e9',
    completed: false,
    locked: true,
    current: false,
    lessons: 7,
    duration: '2h',
  },
  {
    id: 'projects',
    title: 'Capstone',
    description: 'Ship a real project',
    icon: <span>🏆</span>,
    color: '#f59e0b',
    completed: false,
    locked: true,
    current: false,
    lessons: 4,
    duration: '4h',
  },
];

export default function RoadmapDemo() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <h1 className="mb-10 text-center text-2xl font-bold text-slate-800">Course Roadmap</h1>
      <Roadmap
        items={roadmapItems}
        roadWidth={80}
        spacing={250}
        animated
        roadColor="#6366f1"
        onStepSelect={(item) => console.log('selected', item.id)}
      />
    </div>
  );
}
