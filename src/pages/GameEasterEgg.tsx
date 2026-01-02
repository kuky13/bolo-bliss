import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import StoreLayout from "@/components/layout/StoreLayout";
import GameBoard from "@/components/game/GameBoard";
import GameControls from "@/components/game/GameControls";
import GameInstructions from "@/components/game/GameInstructions";
import GameStats from "@/components/game/GameStats";
import DeveloperCredit from "@/components/game/DeveloperCredit";
import { useGameScores } from "@/hooks/useGameScores";
import { GameAudio, createSuccessParticles } from "@/utils/gameEffects";
import { toast } from "@/hooks/use-toast";

type PuzzlePiece = {
  value: number;
  x: number;
  y: number;
};

const GameEasterEgg = () => {
  // Game state
  const [gridSize, setGridSize] = useState(3);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [emptyPos, setEmptyPos] = useState({ x: gridSize - 1, y: gridSize - 1 });
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [startTime, setStartTime] = useState(0);
  const [time, setTime] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [gameAudio] = useState(() => new GameAudio());

  const { saveScore } = useGameScores();

  // Game constants
  const tileSize = Math.min(window.innerWidth - 40, 300) / gridSize;
  const boardSize = tileSize * gridSize;

  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'easy': return { gridSize: 3, shuffleCount: 20 };
      case 'medium': return { gridSize: 4, shuffleCount: 40 };
      case 'hard': return { gridSize: 5, shuffleCount: 80 };
      default: return { gridSize: 3, shuffleCount: 20 };
    }
  };

  const initGame = () => {
    const { gridSize: newSize } = getDifficultySettings();
    setGridSize(newSize);
    setEmptyPos({ x: newSize - 1, y: newSize - 1 });
    setMoves(0);
    setIsSolved(false);
    setIsPlaying(false);
    setTime(0);

    const newPieces: PuzzlePiece[] = [];
    for (let y = 0; y < newSize; y++) {
      for (let x = 0; x < newSize; x++) {
        if (x !== newSize - 1 || y !== newSize - 1) {
          newPieces.push({ value: y * newSize + x + 1, x, y });
        }
      }
    }
    setPieces(newPieces);
  };

  const startGame = () => {
    const { shuffleCount } = getDifficultySettings();
    
    let currentPieces = [...pieces];
    let currentEmpty = { ...emptyPos };
    
    for (let i = 0; i < shuffleCount; i++) {
      const possibleMoves = [
        { x: currentEmpty.x + 1, y: currentEmpty.y },
        { x: currentEmpty.x - 1, y: currentEmpty.y },
        { x: currentEmpty.x, y: currentEmpty.y + 1 },
        { x: currentEmpty.x, y: currentEmpty.y - 1 }
      ].filter(move => move.x >= 0 && move.x < gridSize && move.y >= 0 && move.y < gridSize);

      const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const pieceIndex = currentPieces.findIndex(p => p.x === move.x && p.y === move.y);
      
      if (pieceIndex !== -1) {
        currentPieces[pieceIndex] = { ...currentPieces[pieceIndex], x: currentEmpty.x, y: currentEmpty.y };
        currentEmpty = { x: move.x, y: move.y };
      }
    }
    
    setPieces(currentPieces);
    setEmptyPos(currentEmpty);
    setIsPlaying(true);
    setStartTime(Date.now());
  };

  const checkSolution = () => {
    for (let piece of pieces) {
      const correctPos = {
        x: (piece.value - 1) % gridSize,
        y: Math.floor((piece.value - 1) / gridSize)
      };
      if (piece.x !== correctPos.x || piece.y !== correctPos.y) {
        return false;
      }
    }
    return true;
  };

  const movePiece = (piece: PuzzlePiece) => {
    if (!isPlaying || isSolved) return;

    const isAdjacent = (Math.abs(piece.x - emptyPos.x) === 1 && piece.y === emptyPos.y) ||
                      (Math.abs(piece.y - emptyPos.y) === 1 && piece.x === emptyPos.x);
    
    if (isAdjacent) {
      gameAudio.playMoveSound();
      
      const newPieces = pieces.map(p => {
        if (p.value === piece.value) {
          return { ...p, x: emptyPos.x, y: emptyPos.y };
        }
        return p;
      });

      setEmptyPos({ x: piece.x, y: piece.y });
      setPieces(newPieces);
      setMoves(moves + 1);
    } else {
      gameAudio.playErrorSound();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent | KeyboardEvent) => {
    if (!isPlaying || isSolved) return;
    
    let dx = 0, dy = 0;
    switch (e.key) {
      case 'ArrowUp': dy = 1; break;
      case 'ArrowDown': dy = -1; break;
      case 'ArrowLeft': dx = 1; break;
      case 'ArrowRight': dx = -1; break;
      default: return;
    }

    const pieceToMove = pieces.find(p => p.x === emptyPos.x + dx && p.y === emptyPos.y + dy);
    if (pieceToMove) {
      movePiece(pieceToMove);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPlaying || isSolved) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isPlaying || isSolved) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;

    const minSwipeDistance = 30;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
      const pieceToMove = pieces.find(p =>
        (dx > 0 && p.x === emptyPos.x - 1 && p.y === emptyPos.y) ||
        (dx < 0 && p.x === emptyPos.x + 1 && p.y === emptyPos.y)
      );
      if (pieceToMove) movePiece(pieceToMove);
    } else if (Math.abs(dy) > minSwipeDistance) {
      const pieceToMove = pieces.find(p =>
        (dy > 0 && p.x === emptyPos.x && p.y === emptyPos.y - 1) ||
        (dy < 0 && p.x === emptyPos.x && p.y === emptyPos.y + 1)
      );
      if (pieceToMove) movePiece(pieceToMove);
    }
    setTouchStart(null);
  };

  // Enhanced solution detection with celebrations
  useEffect(() => {
    if (isPlaying && pieces.length > 0) {
      const solved = checkSolution();
      if (solved) {
        setIsSolved(true);
        setIsPlaying(false);
        
        // Play success sound
        gameAudio.playSuccessSound();
        
        // Save score and check for new record
        const result = saveScore(difficulty, moves, time);
        
        // Create visual celebration
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
          createSuccessParticles(gameBoard as HTMLElement);
        }
        
        // Show toast notification
        toast({
          title: result.isNewRecord ? "🏆 Novo Recorde!" : "🎉 Parabéns!",
          description: result.isNewRecord 
            ? `Você estabeleceu um novo recorde em ${difficulty}!`
            : `Puzzle resolvido em ${moves} movimentos e ${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}!`
        });
      }
    }
  }, [pieces, isPlaying, difficulty, moves, time, gameAudio, saveScore]);

  // Effects
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pieces, emptyPos, isPlaying, isSolved]);

  useEffect(() => {
    let timer: number;
    if (isPlaying && !isSolved) {
      timer = window.setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isSolved, startTime]);

  useEffect(() => {
    initGame();
  }, [difficulty]);

  return (
    <StoreLayout>
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <h1 className="mb-6 text-center text-2xl font-bold text-gradient">
            {isSolved ? 'Parabéns!' : 'Quebra-cabeça'}
          </h1>
          
          <GameControls
            moves={moves}
            time={time}
            isPlaying={isPlaying}
            difficulty={difficulty}
            onStartGame={startGame}
            onResetGame={initGame}
            onDifficultyChange={setDifficulty}
            onShowStats={() => setShowStats(true)}
          />
          
          <GameBoard
            pieces={pieces}
            emptyPos={emptyPos}
            gridSize={gridSize}
            boardSize={boardSize}
            tileSize={tileSize}
            isPlaying={isPlaying}
            isSolved={isSolved}
            moves={moves}
            time={time}
            onPieceClick={movePiece}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onStartGame={startGame}
            onResetGame={initGame}
          />
          
          <GameInstructions />
          <DeveloperCredit />
          
          {/* Return button */}
          <div className="text-center">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Home size={16} />
                Voltar para a Loja
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <GameStats isOpen={showStats} onClose={() => setShowStats(false)} />
    </StoreLayout>
  );
};

export default GameEasterEgg;
