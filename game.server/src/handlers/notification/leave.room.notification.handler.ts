import { GamePacketType } from "../../enums/gamePacketType";
import { GamePacket } from "../../generated/gamePacket";
import { Room } from "../../models/room.model";
import { GameSocket } from "../../type/game.socket";
import { broadcastDataToRoom } from "../../utils/notification.util";
import { getRoom } from "../../utils/redis.util";

const leaveRoomNotificationHandler = async (socket: GameSocket, gamePacket:GamePacket) => {
	
    if(!socket.roomId) return

    const room:Room|null = await getRoom(socket.roomId);
    
    if(!room) return;
    
    // 방을 나간 유저의 ID를 담아 알림 패킷을 생성합니다.
	const notificationPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.leaveRoomNotification,
			leaveRoomNotification: {
				userId: socket.userId!,
			}
		},
	};

	// 자신(방을 나간 유저)을 제외한 나머지 유저들에게 알림을 보냅니다.
	broadcastDataToRoom(
		room?.users,
		notificationPacket,
		GamePacketType.leaveRoomNotification,
		socket,
	);
};

export default leaveRoomNotificationHandler;
