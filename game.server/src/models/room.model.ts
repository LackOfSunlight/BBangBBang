import { Player } from "./player.model.js";
import { Game } from "./game.model.js";

export enum RoomStatus {
  Waiting,
  InProgress,
  Finished,
}

export class Room {
  public players: Player[] = [];
  public game: Game | null = null;
  public status: RoomStatus = RoomStatus.Waiting;

  constructor(public id: string, public name: string, private maxPlayers: number = 4) {}

  addPlayer(player: Player): boolean {
    if (this.players.length >= this.maxPlayers) {
      return false; // Room is full
    }
    this.players.push(player);
    return true;
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter((p) => p.id !== playerId);
  }

  isFull(): boolean {
    return this.players.length === this.maxPlayers;
  }

  // Method to start the game
  startGame() {
    if (this.isFull() && this.status === RoomStatus.Waiting) {
      this.status = RoomStatus.InProgress;
      this.game = new Game(this.players);
      // Further game initialization logic...
    }
  }
}
