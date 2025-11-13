
import React from 'react';
import type { Level, QuizQuestion } from './types';
import { GameObjectType } from './types';

export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;
export const PLAYER_WIDTH = 15; // percentage
export const PLAYER_HEIGHT = 8; // percentage
export const PLAYER_SPEED = 50; // percentage of width per second
export const INITIAL_LIVES = 3;
export const SCORE_PER_COIN = 2;
export const INVINCIBILITY_DURATION = 2000; // 2 seconds

export const ICONS: { [key in GameObjectType | 'PLAYER']: React.ReactNode } = {
  [GameObjectType.Obstacle]: (
    <div className="w-full h-full bg-yellow-500" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
      <div className="w-full h-1/4 bg-white"></div>
      <div className="w-full h-1/4 bg-yellow-500"></div>
      <div className="w-full h-1/4 bg-white"></div>
    </div>
  ),
  [GameObjectType.Enemy]: (
    <svg viewBox="0 0 50 100" className="w-full h-full fill-red-600">
      <path d="M10 0 L10 10 L0 20 L0 80 L10 90 L10 100 L40 100 L40 90 L50 80 L50 20 L40 10 L40 0 Z" />
      <path d="M15 20 L35 20 L35 40 L15 40 Z" className="fill-cyan-300" />
      <path d="M15 50 L35 50 L35 70 L15 70 Z" className="fill-cyan-300" />
    </svg>
  ),
  [GameObjectType.Coin]: (
    <div className="w-full h-full rounded-full bg-yellow-400 border-4 border-yellow-600 flex items-center justify-center font-bold text-yellow-800">
      $
    </div>
  ),
  [GameObjectType.MysteryBox]: (
    <div className="w-full h-full bg-purple-600 border-4 border-purple-800 flex items-center justify-center font-bold text-3xl text-white">
      ?
    </div>
  ),
  PLAYER: (
    <svg viewBox="0 0 50 100" className="w-full h-full fill-blue-500">
      <path d="M10 0 L10 10 L0 20 L0 80 L10 90 L10 100 L40 100 L40 90 L50 80 L50 20 L40 10 L40 0 Z" />
      <path d="M15 20 L35 20 L35 40 L15 40 Z" className="fill-cyan-300" />
      <path d="M15 50 L35 50 L35 70 L15 70 Z" className="fill-cyan-300" />
    </svg>
  ),
};

export const LEVELS: Level[] = [
  { level: 1, speed: 20, objectSpawnRate: 1, goalScore: 20, objectProbabilities: { OBSTACLE: 0.2, ENEMY: 0, COIN: 0.7, MYSTERY_BOX: 0.1 } },
  { level: 2, speed: 25, objectSpawnRate: 0.9, goalScore: 40, objectProbabilities: { OBSTACLE: 0.3, ENEMY: 0.1, COIN: 0.5, MYSTERY_BOX: 0.1 } },
  { level: 3, speed: 30, objectSpawnRate: 0.8, goalScore: 60, objectProbabilities: { OBSTACLE: 0.3, ENEMY: 0.2, COIN: 0.4, MYSTERY_BOX: 0.1 } },
  { level: 4, speed: 35, objectSpawnRate: 0.7, goalScore: 80, objectProbabilities: { OBSTACLE: 0.4, ENEMY: 0.2, COIN: 0.3, MYSTERY_BOX: 0.1 } },
  { level: 5, speed: 40, objectSpawnRate: 0.6, goalScore: 100, objectProbabilities: { OBSTACLE: 0.4, ENEMY: 0.3, COIN: 0.2, MYSTERY_BOX: 0.1 } },
  { level: 6, speed: 45, objectSpawnRate: 0.5, goalScore: 130, objectProbabilities: { OBSTACLE: 0.5, ENEMY: 0.3, COIN: 0.1, MYSTERY_BOX: 0.1 } },
  { level: 7, speed: 50, objectSpawnRate: 0.45, goalScore: 160, objectProbabilities: { OBSTACLE: 0.5, ENEMY: 0.35, COIN: 0.05, MYSTERY_BOX: 0.1 } },
  { level: 8, speed: 55, objectSpawnRate: 0.4, goalScore: 200, objectProbabilities: { OBSTACLE: 0.5, ENEMY: 0.4, COIN: 0.05, MYSTERY_BOX: 0.05 } },
  { level: 9, speed: 60, objectSpawnRate: 0.35, goalScore: 250, objectProbabilities: { OBSTACLE: 0.55, ENEMY: 0.4, COIN: 0, MYSTERY_BOX: 0.05 } },
  { level: 10, speed: 70, objectSpawnRate: 0.3, goalScore: 300, objectProbabilities: { OBSTACLE: 0.6, ENEMY: 0.4, COIN: 0, MYSTERY_BOX: 0 } },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    { question: 'Perangkat keras yang berfungsi sebagai "otak" komputer disebut...', options: ['CPU', 'RAM', 'Hard Disk', 'Monitor'], correctAnswer: 'CPU' },
    { question: 'Urutan langkah-langkah logis untuk menyelesaikan masalah disebut...', options: ['Algoritma', 'Program', 'Data', 'Input'], correctAnswer: 'Algoritma' },
    { question: 'Apa kepanjangan dari WWW dalam konteks internet?', options: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'], correctAnswer: 'World Wide Web' },
    { question: 'Sistem bilangan yang hanya menggunakan angka 0 dan 1 adalah...', options: ['Biner', 'Desimal', 'Oktal', 'Heksadesimal'], correctAnswer: 'Biner' },
    { question: 'Bilangan biner 1011 jika diubah ke desimal menjadi...', options: ['11', '10', '9', '13'], correctAnswer: '11' },
    { question: 'Untuk membuat dokumen surat atau laporan, kita menggunakan aplikasi...', options: ['Microsoft Word', 'Microsoft Excel', 'Microsoft PowerPoint', 'Paint'], correctAnswer: 'Microsoft Word' },
    { question: 'Topologi jaringan dimana semua komputer terhubung ke sebuah hub/switch pusat disebut...', options: ['Star', 'Ring', 'Bus', 'Mesh'], correctAnswer: 'Star' },
    { question: 'Ekstensi file standar untuk gambar terkompresi yang umum di web adalah...', options: ['.jpg', '.docx', '.mp3', '.exe'], correctAnswer: '.jpg' },
    { question: 'RAM adalah singkatan dari...', options: ['Random Access Memory', 'Read Only Memory', 'Realtime Application Memory', 'Run All Memory'], correctAnswer: 'Random Access Memory' },
    { question: 'Sebuah diagram yang menggambarkan alur kerja sebuah program adalah...', options: ['Flowchart', 'Mind Map', 'Pie Chart', 'Bar Chart'], correctAnswer: 'Flowchart' }
];
