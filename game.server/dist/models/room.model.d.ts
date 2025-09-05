import { Player } from "./player.model.js";
import { Game } from "./game.model.js";
export declare enum RoomStatus {
    Waiting = 0,
    InProgress = 1,
    Finished = 2
}
export declare class Room {
    id: string;
    name: string;
    private maxPlayers;
    players: Player[];
    game: Game | null;
    status: RoomStatus;
    constructor(id: string, name: string, maxPlayers?: number);
    addPlayer(player: Player): boolean;
    removePlayer(playerId: string): void;
    isFull(): boolean;
    startGame(): void;
}
//# sourceMappingURL=room.model.d.ts.map