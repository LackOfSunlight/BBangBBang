import { Player } from "./player.model.js";
export type PlayerRole = "Citizen" | "Mafia" | "Doctor" | "Police";
export declare class Game {
    players: Player[];
    playerRoles: Map<string, PlayerRole>;
    constructor(players: Player[]);
    private assignRoles;
}
//# sourceMappingURL=game.model.d.ts.map