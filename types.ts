
export enum GameObjectType {
  Obstacle = 'OBSTACLE',
  Enemy = 'ENEMY',
  Coin = 'COIN',
  MysteryBox = 'MYSTERY_BOX',
}

export interface GameObject {
  id: number;
  type: GameObjectType;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  width: number; // percentage of game area width
  height: number; // percentage of game area height
  dx?: number; // horizontal velocity for enemies
}

export interface Player {
  x: number; // percentage from left
  width: number;
  height: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export enum GameState {
  StartScreen,
  Playing,
  Quiz,
  LevelComplete,
  GameOver,
  GameWon,
}

export interface Level {
    level: number;
    speed: number; // units per second (percentage of game height)
    objectSpawnRate: number; // seconds between spawns
    goalScore: number;
    objectProbabilities: {
        [GameObjectType.Obstacle]: number;
        [GameObjectType.Enemy]: number;
        [GameObjectType.Coin]: number;
        [GameObjectType.MysteryBox]: number;
    };
}