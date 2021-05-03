export interface IMatchData {
  date: number;
  decision: "win" | "lose" | "draw";
  map: string;
  mmr: number;
  opponent?: string;
  opponentMmr?: number;
  opponentRace?: "protoss" | "terran" | "zerg";
  youtubeLink?: string;
}
