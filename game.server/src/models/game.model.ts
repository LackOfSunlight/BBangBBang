import { Player } from "./player.model.js";

// Define a type for roles, can be expanded later
export type PlayerRole = "Citizen" | "Mafia" | "Doctor" | "Police";

export class Game {
  // Map player ID to their assigned role
  public playerRoles: Map<string, PlayerRole> = new Map();

  constructor(public players: Player[]) {
    this.assignRoles();
  }

  private assignRoles() {
    // Example role assignment logic, needs to be more robust
    const roles: PlayerRole[] = ["Mafia", "Doctor", "Police", "Citizen"];
    const shuffledPlayers = [...this.players].sort(() => Math.random() - 0.5);

    shuffledPlayers.forEach((player, index) => {
      const role = roles[index % roles.length]; // Simple assignment
      this.playerRoles.set(player.id, role);
      console.log(`Player ${player.nickname} assigned role: ${role}`);
    });
  }

  // Add game logic methods here
  // e.g., handleTurn, processAction, checkWinCondition, etc.
}
