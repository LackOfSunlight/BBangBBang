import { Room } from "../models/room.model.js";
import { Player } from "../models/player.model.js";
declare class RoomService {
    private rooms;
    createRoom(name: string): Room;
    findRoom(roomId: string): Room | undefined;
    joinRoom(roomId: string, player: Player): boolean;
    leaveRoom(roomId: string, playerId: string): void;
    getRoomList(): Room[];
}
export declare const roomService: RoomService;
export {};
//# sourceMappingURL=room.service.d.ts.map