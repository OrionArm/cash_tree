type PlayerRanking = {
  id: number;
  name: string;
  gold: number;
  cristal: number;
  position: number;
};

export class RankingService {
  private static generateMockPlayers(): PlayerRanking[] {
    const players: PlayerRanking[] = [];

    for (let i = 1; i <= 7; i++) {
      players.push({
        id: i,
        name: `Player_${i.toString().padStart(3, '0')}`,
        position: Math.floor(Math.random() * 50),
        gold: Math.floor(Math.random() * 10000) + 100,
        cristal: Math.floor(Math.random() * 100),
      });
    }

    return players;
  }

  static getRankedPlayers(currentPlayer?: PlayerRanking): PlayerRanking[] {
    const players = this.generateMockPlayers();

    if (currentPlayer) {
      players.push(currentPlayer);
    }

    return players.sort((a, b) => {
      const scoreA = a.gold + a.cristal * 100;
      const scoreB = b.gold + b.cristal * 100;
      return scoreB - scoreA;
    });
  }

  static getPlayerRank(currentPlayer: PlayerRanking, allPlayers: PlayerRanking[]): number {
    const sortedPlayers = [...allPlayers].sort((a, b) => {
      const scoreA = a.gold + a.cristal * 100;
      const scoreB = b.gold + b.cristal * 100;
      return scoreB - scoreA;
    });

    return sortedPlayers.findIndex((player) => player.id === currentPlayer.id) + 1;
  }

  static getNearbyPlayers(
    currentPlayer: PlayerRanking,
    allPlayers: PlayerRanking[],
    count: number = 3,
  ): PlayerRanking[] {
    const sortedPlayers = [...allPlayers].sort((a, b) => {
      const scoreA = a.gold + a.cristal * 100;
      const scoreB = b.gold + b.cristal * 100;
      return scoreB - scoreA;
    });

    const currentIndex = sortedPlayers.findIndex((player) => player.id === currentPlayer.id);

    if (currentIndex === -1) return [];

    const start = Math.max(0, currentIndex - count);
    const end = Math.min(sortedPlayers.length, currentIndex + count + 1);

    return sortedPlayers.slice(start, end).filter((player) => player.id !== currentPlayer.id);
  }
}
