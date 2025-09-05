import { Game } from "./game.model.js";
export var RoomStatus;
(function (RoomStatus) {
    RoomStatus[RoomStatus["Waiting"] = 0] = "Waiting";
    RoomStatus[RoomStatus["InProgress"] = 1] = "InProgress";
    RoomStatus[RoomStatus["Finished"] = 2] = "Finished";
})(RoomStatus || (RoomStatus = {}));
export class Room {
    id;
    name;
    maxPlayers;
    players = [];
    game = null;
    status = RoomStatus.Waiting;
    constructor(id, name, maxPlayers = 4) {
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
    }
    addPlayer(player) {
        if (this.players.length >= this.maxPlayers) {
            return false; // Room is full
        }
        this.players.push(player);
        return true;
    }
    removePlayer(playerId) {
        this.players = this.players.filter((p) => p.id !== playerId);
    }
    isFull() {
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
