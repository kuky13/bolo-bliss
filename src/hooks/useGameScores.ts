import { useState, useEffect } from 'react';

interface GameScore {
  difficulty: 'easy' | 'medium' | 'hard';
  moves: number;
  time: number;
  date: string;
}

interface GameStats {
  gamesPlayed: number;
  bestScores: {
    easy?: GameScore;
    medium?: GameScore;
    hard?: GameScore;
  };
  recentScores: GameScore[];
}

export const useGameScores = () => {
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    bestScores: {},
    recentScores: []
  });

  useEffect(() => {
    const savedStats = localStorage.getItem('puzzle-game-stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Error parsing game stats:', error);
      }
    }
  }, []);

  const saveScore = (difficulty: 'easy' | 'medium' | 'hard', moves: number, time: number) => {
    const newScore: GameScore = {
      difficulty,
      moves,
      time,
      date: new Date().toISOString()
    };

    const newStats = { ...stats };
    
    // Increment games played
    newStats.gamesPlayed += 1;
    
    // Check if this is a new best score (fewer moves, or same moves but less time)
    const currentBest = newStats.bestScores[difficulty];
    if (!currentBest || moves < currentBest.moves || (moves === currentBest.moves && time < currentBest.time)) {
      newStats.bestScores[difficulty] = newScore;
    }
    
    // Add to recent scores (keep last 10)
    newStats.recentScores = [newScore, ...newStats.recentScores].slice(0, 10);
    
    setStats(newStats);
    localStorage.setItem('puzzle-game-stats', JSON.stringify(newStats));
    
    return {
      isNewRecord: !currentBest || moves < currentBest.moves || (moves === currentBest.moves && time < currentBest.time)
    };
  };

  const resetStats = () => {
    const emptyStats = {
      gamesPlayed: 0,
      bestScores: {},
      recentScores: []
    };
    setStats(emptyStats);
    localStorage.setItem('puzzle-game-stats', JSON.stringify(emptyStats));
  };

  return {
    stats,
    saveScore,
    resetStats
  };
};
