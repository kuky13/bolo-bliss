
import React from 'react';
import { Button } from "@/components/ui/button";
import { Gamepad2, RefreshCw, Trophy, BarChart3 } from "lucide-react";
import { useGameScores } from "@/hooks/useGameScores";

interface GameControlsProps {
  moves: number;
  time: number;
  isPlaying: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  onStartGame: () => void;
  onResetGame: () => void;
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onShowStats: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  moves,
  time,
  isPlaying,
  difficulty,
  onStartGame,
  onResetGame,
  onDifficultyChange,
  onShowStats
}) => {
  const { stats } = useGameScores();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBestScore = () => {
    const best = stats.bestScores[difficulty];
    return best ? `${best.moves} movimentos em ${formatTime(best.time)}` : 'Nenhum recorde';
  };

  return (
    <>
      {/* Game info panel */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm space-y-1">
            <div><span className="font-bold text-store-pink">Movimentos:</span> {moves}</div>
            <div><span className="font-bold text-store-pink">Tempo:</span> {formatTime(time)}</div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onShowStats}
              className="flex items-center gap-1"
            >
              <BarChart3 size={16} />
              Stats
            </Button>
            
            {!isPlaying ? (
              <Button onClick={onStartGame} className="flex items-center gap-2">
                <Gamepad2 size={18} />
                Jogar
              </Button>
            ) : (
              <Button variant="outline" onClick={onResetGame} className="flex items-center gap-2">
                <RefreshCw size={18} />
                Reiniciar
              </Button>
            )}
          </div>
        </div>
        
        {/* Best score display */}
        <div className="text-xs text-gray-600 flex items-center gap-1">
          <Trophy size={14} className="text-yellow-500" />
          <span>Melhor {difficulty}: {getBestScore()}</span>
        </div>
      </div>
      
      {/* Difficulty selector */}
      <div className="mb-4 flex justify-center space-x-2">
        {(['easy', 'medium', 'hard'] as const).map(level => (
          <Button
            key={level}
            variant={difficulty === level ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (!isPlaying || window.confirm('Alterar a dificuldade reiniciará o jogo. Continuar?')) {
                onDifficultyChange(level);
              }
            }}
            className="relative"
          >
            {{
              easy: 'Fácil',
              medium: 'Médio', 
              hard: 'Difícil'
            }[level]}
            {stats.bestScores[level] && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
            )}
          </Button>
        ))}
      </div>

      {/* Game tips */}
      <div className="mb-6 text-center">
        <div className="text-xs text-gray-500 max-w-xs mx-auto">
          💡 Dica: Tente resolver uma linha de cada vez, começando pela superior
        </div>
      </div>
    </>
  );
};

export default GameControls;
