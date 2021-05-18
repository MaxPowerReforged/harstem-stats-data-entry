export interface IMatchData {
  date: number;
  decision: "Win" | "Lose" | "Draw";
  map: string;
  mmr: number;
  opponent?: string;
  opponentMmr?: number;
  opponentRace?: "protoss" | "terran" | "zerg";
  youtubeLink?: string;
}
