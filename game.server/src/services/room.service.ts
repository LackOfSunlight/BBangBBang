import { Room } from "../models/room.model.js";
import { Player } from "../models/player.model.js";

class RoomService {
  private rooms: Map<string, Room> = new Map();

  createRoom(name: string): Room {
    const roomId = `room-${this.rooms.size + 1}`; // Simple ID generation
    const room = new Room(roomId, name);
    this.rooms.set(roomId, room);
    console.log(`Room created: ${name} (ID: ${roomId})`);
    return room;
  }

  findRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, player: Player): boolean {
    const room = this.findRoom(roomId);
    if (room) {
      return room.addPlayer(player);
    }
    return false;
  }

  leaveRoom(roomId: string, playerId: string) {
    const room = this.findRoom(roomId);
    if (room) {
      room.removePlayer(playerId);
    }
  }

  getRoomList(): Room[] {
    return Array.from(this.rooms.values());
  }
}

// Export a singleton instance
export const roomService = new RoomService();
