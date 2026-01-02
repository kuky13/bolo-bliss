
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Move, Calendar, Trash2 } from "lucide-react";
import { useGameScores } from "@/hooks/useGameScores";

interface GameStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameStats: React.FC<GameStatsProps> = ({ isOpen, onClose }) => {
  const { stats, resetStats } = useGameScores();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDifficultyName = (difficulty: string) => {
    const names = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
    return names[difficulty as keyof typeof names] || difficulty;
  };

  const handleResetStats = () => {
    if (window.confirm('Tem certeza que deseja apagar todas as estatísticas? Esta ação não pode ser desfeita.')) {
      resetStats();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-store-pink">
            <Trophy className="h-5 w-5" />
            Estatísticas do Jogo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.gamesPlayed}</div>
                  <div className="text-sm text-gray-600">Jogos Concluídos</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(stats.bestScores).length}
                  </div>
                  <div className="text-sm text-gray-600">Recordes Estabelecidos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Melhores Pontuações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(['easy', 'medium', 'hard'] as const).map(difficulty => {
                  const best = stats.bestScores[difficulty];
                  return (
                    <div key={difficulty} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{getDifficultyName(difficulty)}</div>
                      {best ? (
                        <div className="text-sm text-gray-600 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Move className="h-4 w-4" />
                            {best.moves}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(best.time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(best.date)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Nenhum recorde</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Games */}
          {stats.recentScores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Jogos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {stats.recentScores.map((score, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{getDifficultyName(score.difficulty)}</div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <span>{score.moves} movimentos</span>
                        <span>{formatTime(score.time)}</span>
                        <span>{formatDate(score.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {stats.gamesPlayed > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleResetStats}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Estatísticas
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameStats;
