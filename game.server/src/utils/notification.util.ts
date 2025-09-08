import { GamePacketType } from "../enums/gamePacketType.js";
import { GamePacket } from "../generated/gamePacket.js";
import { User } from "../models/user.model.js";
import { GameSocket } from "../type/game.socket.js";
import { sendData } from "./send.data.js";

// 클라이언트 소켓들을 관리하는 전역 맵 (Redis와 동기화 필요)
const connectedSockets = new Map<string, GameSocket>();

// 새로운 소켓이 연결될 때 맵에 추가하는 함수
export const addSocket = (userId: string, socket: GameSocket) => {
    connectedSockets.set(userId, socket);
}

// 소켓 연결이 끊겼을 때 맵에서 제거하는 함수
export const removeSocket = (userId: string) => {
    connectedSockets.delete(userId);
}

// 특정 방의 모든 사용자에게 알림을 보내는 함수
export const broadcastDataToRoom = (users: User[], gamePacket: GamePacket, packetType: GamePacketType, excludeSocket: GameSocket) => {
    users.forEach(user => {
        const targetSocket = connectedSockets.get(user.id);
        if (targetSocket && targetSocket.userId !== excludeSocket.userId) {
            sendData(targetSocket, gamePacket, packetType);
        }
    });
}