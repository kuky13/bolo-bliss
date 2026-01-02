import React from 'react';

interface PuzzlePiece {
  value: number;
  x: number;
  y: number;
}

interface GameBoardProps {
  pieces: PuzzlePiece[];
  emptyPos: { x: number; y: number };
  gridSize: number;
  boardSize: number;
  tileSize: number;
  isPlaying: boolean;
  isSolved: boolean;
  moves: number;
  time: number;
  onPieceClick: (piece: PuzzlePiece) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onStartGame: () => void;
  onResetGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  pieces,
  emptyPos,
  gridSize,
  boardSize,
  tileSize,
  isPlaying,
  isSolved,
  moves,
  time,
  onPieceClick,
  onTouchStart,
  onTouchEnd,
  onStartGame,
  onResetGame
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPiece = (piece: PuzzlePiece) => {
    const isCorrectPosition = 
      piece.x === (piece.value - 1) % gridSize && 
      piece.y === Math.floor((piece.value - 1) / gridSize);

    return (
      <div
        key={piece.value}
        onClick={() => onPieceClick(piece)}
        className={`absolute flex items-center justify-center rounded-md cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95
          ${isCorrectPosition 
            ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          } 
          border-2 ${isPlaying ? '' : 'border-store-pink'}
          shadow-md hover:shadow-lg select-none`}
        style={{
          width: tileSize + 'px',
          height: tileSize + 'px',
          left: piece.x * tileSize + 'px',
          top: piece.y * tileSize + 'px',
          fontSize: tileSize / 2.5 + 'px',
          fontWeight: 'bold',
          color: isCorrectPosition ? 'rgb(22, 163, 74)' : '#FF1B8D',
          transition: 'left 0.2s, top 0.2s, transform 0.1s, box-shadow 0.2s'
        }}
      >
        {piece.value}
      </div>
    );
  };

  return (
    <div
      className="game-board relative mb-6 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-200 shadow-lg touch-none"
      style={{
        width: boardSize + 'px',
        height: boardSize + 'px',
        maxWidth: '100%',
        touchAction: 'none'
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {pieces.map(renderPiece)}
      
      {/* Game overlay messages */}
      {!isPlaying && pieces.length > 0 && !isSolved && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-lg">
          <div className="text-center p-4">
            <p className="text-lg font-bold mb-2">Pronto para começar?</p>
            <button
              onClick={onStartGame}
              className="px-4 py-2 bg-store-pink text-white rounded-lg hover:bg-store-pink/90 transition-colors"
            >
              Iniciar Jogo
            </button>
          </div>
        </div>
      )}
      
      {isSolved && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-lg animate-fade-in">
          <div className="text-center p-6">
            <p className="text-xl font-bold mb-2">Você venceu! 🎉</p>
            <p className="mb-4">
              Movimentos: {moves} | Tempo: {formatTime(time)}
            </p>
            <button
              onClick={onResetGame}
              className="px-4 py-2 bg-store-pink text-white rounded-lg hover:bg-store-pink/90 transition-colors"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
