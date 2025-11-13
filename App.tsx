
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GameObject, QuizQuestion, Player } from './types';
import { GameState, GameObjectType } from './types';
import { LEVELS, QUIZ_QUESTIONS, ICONS, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, INITIAL_LIVES, SCORE_PER_COIN, INVINCIBILITY_DURATION, GAME_WIDTH, GAME_HEIGHT } from './constants';

// --- Sound Effects Logic using Web Audio API ---
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
    if (!audioContext && (window.AudioContext || (window as any).webkitAudioContext)) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
            return null;
        }
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
};

const playSound = (freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.2) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
};

const playCoinSound = () => { playSound(1046.50, 0.1, 'triangle'); setTimeout(() => playSound(1318.51, 0.1, 'triangle'), 50); };
const playCollisionSound = () => { playSound(110, 0.3, 'sawtooth'); };
const playMysteryBoxSound = () => { playSound(523.25, 0.1, 'square'); setTimeout(() => playSound(659.25, 0.1, 'square'), 100); setTimeout(() => playSound(783.99, 0.1, 'square'), 200); };
const playCorrectAnswerSound = () => { playSound(783.99, 0.15, 'sine'); setTimeout(() => playSound(1046.50, 0.2, 'sine'), 150); };
const playIncorrectAnswerSound = () => { playSound(220, 0.15, 'square'); setTimeout(() => playSound(164.81, 0.2, 'square'), 150); };
const playButtonClickSound = () => { getAudioContext(); playSound(440, 0.1, 'sine', 0.1); };
const playLevelCompleteSound = () => { playSound(523.25, 0.1); setTimeout(() => playSound(659.25, 0.1), 120); setTimeout(() => playSound(783.99, 0.1), 240); setTimeout(() => playSound(1046.50, 0.3), 360); };
const playGameOverSound = () => { playSound(329.63, 0.2, 'sawtooth'); setTimeout(() => playSound(261.63, 0.2, 'sawtooth'), 200); setTimeout(() => playSound(196.00, 0.4, 'sawtooth'), 400); };
// --- End of Sound Effects Logic ---


const ScreenOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-center p-4 z-20">
    {children}
  </div>
);

const GameButton: React.FC<{ onClick: () => void; children: React.ReactNode, className?: string }> = ({ onClick, children, className = '' }) => (
  <button
    onClick={() => {
        playButtonClickSound();
        onClick();
    }}
    className={`mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition duration-300 transform hover:scale-105 ${className}`}
  >
    {children}
  </button>
);

const HUD: React.FC<{ lives: number; score: number; level: number }> = ({ lives, score, level }) => (
  <div className="absolute top-0 left-0 right-0 p-4 bg-slate-800 bg-opacity-50 flex justify-between items-center text-lg z-10">
    <div><span className="font-bold">Lives:</span> {'❤️'.repeat(lives)}</div>
    <div><span className="font-bold">Score:</span> {score}</div>
    <div><span className="font-bold">Level:</span> {level}</div>
  </div>
);


const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.StartScreen);
    const [level, setLevel] = useState(1);
    const [lives, setLives] = useState(INITIAL_LIVES);
    const [score, setScore] = useState(0);
    const [player, setPlayer] = useState<Player>({ x: 50 - PLAYER_WIDTH / 2, width: PLAYER_WIDTH, height: PLAYER_HEIGHT });
    const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
    const [isInvincible, setIsInvincible] = useState(false);
    const roadOffset = useRef(0);

    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const gameLoopRef = useRef<number | null>(null);
    const lastSpawnTime = useRef(Date.now());
    const lastFrameTime = useRef(Date.now());
    const musicIntervalRef = useRef<number | null>(null);

    const currentLevelConfig = LEVELS[level - 1];
    
    // --- Background Music Logic ---
    const stopBackgroundMusic = useCallback(() => {
        if (musicIntervalRef.current) {
            clearInterval(musicIntervalRef.current);
            musicIntervalRef.current = null;
        }
    }, []);
    
    const playBackgroundMusic = useCallback(() => {
        const ctx = getAudioContext();
        if (!ctx || musicIntervalRef.current) return;

        const notes = [130.81, 164.81, 196.00, 164.81]; // C3, E3, G3, E3 arpeggio
        let noteIndex = 0;

        const playNote = () => {
            playSound(notes[noteIndex], 0.18, 'sine', 0.08); // Low volume
            noteIndex = (noteIndex + 1) % notes.length;
        };
        
        musicIntervalRef.current = window.setInterval(playNote, 200);
    }, []);
    // --- End of Background Music Logic ---


    const resetGame = (startLevel: number) => {
        setLevel(startLevel);
        setLives(INITIAL_LIVES);
        setScore(0);
        setPlayer({ x: 50 - PLAYER_WIDTH / 2, width: PLAYER_WIDTH, height: PLAYER_HEIGHT });
        setGameObjects([]);
        setIsInvincible(false);
        lastSpawnTime.current = Date.now();
        lastFrameTime.current = Date.now();
    };

    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const spawnGameObject = useCallback(() => {
        const { objectProbabilities } = currentLevelConfig;
        const rand = Math.random();
        let cumulativeProb = 0;

        for (const key in objectProbabilities) {
            const type = key as GameObjectType;
            cumulativeProb += objectProbabilities[type];
            if (rand <= cumulativeProb) {
                let objWidth = 0, objHeight = 0;
                let dx;
                switch (type) {
                    case GameObjectType.Coin: objWidth = 6; objHeight = 3; break;
                    case GameObjectType.MysteryBox: objWidth = 10; objHeight = 5; break;
                    case GameObjectType.Obstacle: objWidth = 10; objHeight = 5; break;
                    case GameObjectType.Enemy: 
                        objWidth = PLAYER_WIDTH; 
                        objHeight = PLAYER_HEIGHT; 
                        dx = (Math.random() > 0.5 ? 1 : -1) * (15 + level * 1.5); // Enemy horizontal speed increases with level
                        break;
                }
                
                setGameObjects(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    type,
                    x: Math.random() * (100 - objWidth),
                    y: -objHeight,
                    width: objWidth,
                    height: objHeight,
                    dx,
                }]);
                break;
            }
        }
    }, [currentLevelConfig, level]);

    const gameLoop = useCallback(() => {
        const now = Date.now();
        const deltaTime = (now - lastFrameTime.current) / 1000;
        lastFrameTime.current = now;
        
        roadOffset.current = (roadOffset.current + currentLevelConfig.speed * deltaTime * 0.2) % 100;

        // Player Movement
        setPlayer(p => {
            let newX = p.x;
            if (keysPressed.current['ArrowLeft']) newX -= PLAYER_SPEED * deltaTime;
            if (keysPressed.current['ArrowRight']) newX += PLAYER_SPEED * deltaTime;
            return { ...p, x: Math.max(0, Math.min(100 - p.width, newX)) };
        });

        // Move and Check Collisions
        setGameObjects(prev => {
            const newObjects = prev.map(obj => {
                let newX = obj.x;
                let newDx = obj.dx;
                const newY = obj.y + currentLevelConfig.speed * deltaTime;

                // Handle enemy horizontal movement
                if (obj.type === GameObjectType.Enemy && newDx) {
                    newX += newDx * deltaTime;
                    if (newX <= 0 || newX >= 100 - obj.width) {
                        newDx = -newDx; // Reverse direction on hitting edge
                        newX = Math.max(0, Math.min(100 - obj.width, newX)); // Clamp position
                    }
                }
                return { ...obj, y: newY, x: newX, dx: newDx };
            }).filter(obj => obj.y < 110);
            
            const playerRect = { x: player.x, y: 100 - player.height - 5, width: player.width, height: player.height };

            for (const obj of newObjects) {
                const objRect = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
                const collision = playerRect.x < objRect.x + objRect.width &&
                                playerRect.x + playerRect.width > objRect.x &&
                                playerRect.y < objRect.y + objRect.height &&
                                playerRect.y + playerRect.height > objRect.y;

                if (collision) {
                    switch (obj.type) {
                        case GameObjectType.Coin:
                            playCoinSound();
                            setScore(s => s + SCORE_PER_COIN);
                            return newObjects.filter(o => o.id !== obj.id);
                        case GameObjectType.MysteryBox:
                            playMysteryBoxSound();
                            const question = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
                            setCurrentQuestion(question);
                            setGameState(GameState.Quiz);
                            return newObjects.filter(o => o.id !== obj.id);
                        case GameObjectType.Enemy:
                        case GameObjectType.Obstacle:
                            if (!isInvincible) {
                                playCollisionSound();
                                setIsInvincible(true);
                                setLives(l => l - 1);
                                setTimeout(() => setIsInvincible(false), INVINCIBILITY_DURATION);
                            }
                            return newObjects.filter(o => o.id !== obj.id);
                    }
                }
            }
            return newObjects;
        });

        // Spawn new objects
        if (now - lastSpawnTime.current > currentLevelConfig.objectSpawnRate * 1000) {
            spawnGameObject();
            lastSpawnTime.current = now;
        }
        
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [currentLevelConfig, player.x, player.width, player.height, isInvincible, spawnGameObject]);

    useEffect(() => {
        if (gameState === GameState.Playing) {
            lastFrameTime.current = Date.now();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        } else {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, gameLoop]);

    useEffect(() => {
        if (lives <= 0) {
            setGameState(GameState.GameOver);
        }
    }, [lives]);
    
    useEffect(() => {
        if (gameState === GameState.Playing) {
            playBackgroundMusic();
        } else {
            stopBackgroundMusic();
        }

        switch(gameState) {
            case GameState.LevelComplete:
                playLevelCompleteSound();
                break;
            case GameState.GameOver:
                playGameOverSound();
                break;
            default:
                break;
        }
        
        return () => {
          stopBackgroundMusic();
        }
    }, [gameState, playBackgroundMusic, stopBackgroundMusic]);

    useEffect(() => {
        if (score >= currentLevelConfig.goalScore) {
            if (level === LEVELS.length) {
                setGameState(GameState.GameWon);
            } else {
                setGameState(GameState.LevelComplete);
            }
        }
    }, [score, currentLevelConfig.goalScore, level]);

    const handleQuizAnswer = (answer: string) => {
        if (answer === currentQuestion?.correctAnswer) {
            playCorrectAnswerSound();
            setLives(l => l + 1);
        } else {
            playIncorrectAnswerSound();
        }
        setCurrentQuestion(null);
        setGameState(GameState.Playing);
    };

    const renderGameState = () => {
        switch (gameState) {
            case GameState.StartScreen:
                return (
                    <ScreenOverlay>
                        <h1 className="text-6xl font-bold text-cyan-400 drop-shadow-lg">Informatics Racer</h1>
                        <p className="mt-4 text-xl max-w-lg">Drive, dodge, and learn! Hit mystery boxes to answer informatics questions and earn extra lives.</p>
                        <GameButton onClick={() => { resetGame(1); setGameState(GameState.Playing); }}>Start Game</GameButton>
                    </ScreenOverlay>
                );
            case GameState.Quiz:
                return (
                    <ScreenOverlay>
                        <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-2xl w-full">
                          <h2 className="text-2xl font-bold mb-4">{currentQuestion?.question}</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion?.options.map(option => (
                                <button key={option} onClick={() => handleQuizAnswer(option)} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200">
                                    {option}
                                </button>
                            ))}
                          </div>
                        </div>
                    </ScreenOverlay>
                );
            case GameState.LevelComplete:
                return (
                    <ScreenOverlay>
                        <h2 className="text-5xl font-bold text-green-400">Level {level} Complete!</h2>
                        <p className="text-2xl mt-2">Final Score: {score}</p>
                        <GameButton onClick={() => { setLevel(l => l + 1); setGameObjects([]); setGameState(GameState.Playing); }}>Next Level</GameButton>
                    </ScreenOverlay>
                );
            case GameState.GameOver:
                return (
                    <ScreenOverlay>
                        <h2 className="text-6xl font-bold text-red-500">Game Over</h2>
                        <p className="text-2xl mt-2">Final Score: {score}</p>
                        <GameButton onClick={() => { resetGame(1); setGameState(GameState.StartScreen); }}>Play Again</GameButton>
                    </ScreenOverlay>
                );
            case GameState.GameWon:
                return (
                    <ScreenOverlay>
                        <h2 className="text-6xl font-bold text-yellow-400">Congratulations!</h2>
                        <p className="text-2xl mt-2">You've completed all levels!</p>
                        <p className="text-3xl mt-4">Final Score: {score}</p>
                        <GameButton onClick={() => { resetGame(1); setGameState(GameState.StartScreen); }}>Play Again</GameButton>
                    </ScreenOverlay>
                );
            default: return null;
        }
    };
    
    const roadLineStyle: React.CSSProperties = {
        position: 'absolute',
        width: '2%',
        height: '15%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        left: '49%',
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div 
                className="bg-gray-700 relative overflow-hidden shadow-2xl border-4 border-slate-600"
                style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
            >
                <div className="absolute inset-0 bg-repeat-y" style={{
                    backgroundImage: 'linear-gradient(to right, #4a5568 48%, #4a5568 52%, transparent 52%, transparent 100%)',
                    backgroundSize: '100% 100%',
                    backgroundPosition: `${roadOffset.current}% 0`,
                }}>
                  {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ ...roadLineStyle, top: `${(i * 25 - 100 + roadOffset.current)}%` }}></div>
                  ))}
                  {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ ...roadLineStyle, top: `${(i * 25 + roadOffset.current)}%` }}></div>
                  ))}
                </div>


                {gameState === GameState.Playing && <HUD lives={lives} score={score} level={level} />}
                
                {/* Player Car */}
                <div 
                    className={`absolute bottom-5 transition-opacity duration-300 ${isInvincible ? 'opacity-50 animate-pulse' : 'opacity-100'}`}
                    style={{ left: `${player.x}%`, width: `${player.width}%`, height: `${player.height}%` }}
                >
                    {ICONS.PLAYER}
                </div>

                {/* Game Objects */}
                {gameObjects.map(obj => (
                    <div 
                        key={obj.id} 
                        className="absolute"
                        style={{ left: `${obj.x}%`, top: `${obj.y}%`, width: `${obj.width}%`, height: `${obj.height}%` }}
                    >
                        {ICONS[obj.type]}
                    </div>
                ))}
                
                {renderGameState()}
            </div>
        </div>
    );
};

export default App;
