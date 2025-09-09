import { GameSocket } from "../../type/game.socket.js";
import { S2CPhaseUpdateNotification } from "../../generated/packet/notifications.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { GamePacketType } from "../../enums/gamePacketType.js";
import { PhaseType, RoomStateType } from "../../generated/common/enums.js";
import { CharacterPositionData } from "../../generated/common/types.js";
import { broadcastDataToRoom } from "../../utils/notification.util.js";
import { getRoom } from "../../utils/redis.util.js";
import { Room } from "../../models/room.model.js";

const phaseUpdateNotificationHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
    if (!socket.roomId) return;

    const room: Room | null = await getRoom(socket.roomId);
    if (!room) return;

    // 게임 중인 방에서만 페이즈 업데이트 가능
    if (room.state !== RoomStateType.INGAME) return;

    // 페이즈 타입 검증 (유효한 PhaseType인지)
    if (gamePacket.payload.oneofKind === "phaseUpdateNotification") {
        const phaseType = gamePacket.payload.phaseUpdateNotification.phaseType;
        if (!Object.values(PhaseType).includes(phaseType)) return;
    }

    broadcastDataToRoom(room.users, gamePacket, GamePacketType.phaseUpdateNotification);
};

export const setPhaseUpdateNotification = (
    phaseType: PhaseType, // DAY 1, EVENING 2, END 3
    nextPhaseAt: string, // 다음 페이즈 시작 시점(밀리초 타임스탬프)
    characterPositions: CharacterPositionData[] // 변경된 캐릭터 위치 
): GamePacket => {
    const newGamePacket: GamePacket = {
        payload: {
            oneofKind: GamePacketType.phaseUpdateNotification,
            phaseUpdateNotification: {
                phaseType,
                nextPhaseAt,
                characterPositions
            }
        }
    };

    return newGamePacket;
};

export default phaseUpdateNotificationHandler;
