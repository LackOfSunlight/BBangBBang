import { Room } from "../models/room.model.js";
class RoomService {
    rooms = new Map();
    createRoom(name) {
        const roomId = `room-${this.rooms.size + 1}`; // Simple ID generation
        const room = new Room(roomId, name);
        this.rooms.set(roomId, room);
        console.log(`Room created: ${name} (ID: ${roomId})`);
        return room;
    }
    findRoom(roomId) {
        return this.rooms.get(roomId);
    }
    joinRoom(roomId, player) {
        const room = this.findRoom(roomId);
        if (room) {
            return room.addPlayer(player);
        }
        return false;
    }
    leaveRoom(roomId, playerId) {
        const room = this.findRoom(roomId);
        if (room) {
            room.removePlayer(playerId);
        }
    }
    getRoomList() {
        return Array.from(this.rooms.values());
    }
}
// Export a singleton instance
export const roomService = new RoomService();
