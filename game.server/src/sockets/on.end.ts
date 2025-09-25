import { handleError } from '../handlers/handleError.js';
import { removeSocket } from '../managers/socket.manger.js';
import { GameSocket } from '../type/game.socket.js';
import { removeTokenUserDB } from '../services/prisma.service.js';
import { deleteRoom, getRoom, removeUserFromRoom, saveRoom } from '../utils/room.utils.js';
import { checkAndEndGameIfNeeded } from '../services/game.end.service.js';
import { broadcastDataToRoom } from './notification.js';
import { GamePacketType } from '../enums/gamePacketType.js';
import { RoomStateType } from '../generated/common/enums.js';
import { userUpdateNotificationPacketForm } from '../converter/packet.form.js';


const onEnd = (socket: GameSocket) => async () => {
	try {
		console.log('클라이언트 연결이 종료되었습니다.');
		removeSocket(socket);

		if (socket.userId) {
			await removeTokenUserDB(Number(socket.userId));
		}

		if (socket.roomId) {
			const room = getRoom(Number(socket.roomId));
			if (room) {
				// 게임 중인 경우 플레이어를 죽은 상태로 처리
				if (room.state === RoomStateType.INGAME) {
					const disconnectedUser = room.users.find(user => user.id === socket.userId);
					if (disconnectedUser && disconnectedUser.character && disconnectedUser.character.hp > 0) {
												
						// 플레이어 HP를 0으로 설정하여 죽은 상태로 처리
						disconnectedUser.character.hp = 0;
						
						// 방 상태 저장
						saveRoom(room);
						
						// 모든 플레이어에게 사용자 상태 업데이트 알림 전송
						const userUpdatePacket = userUpdateNotificationPacketForm(room.users);
						await broadcastDataToRoom(room.users, userUpdatePacket, GamePacketType.userUpdateNotification);
						
						// 게임 종료 조건 확인
						await checkAndEndGameIfNeeded(Number(socket.roomId));
					}
				}
				
				// 기존 로직: 방에서 사용자 제거
				removeUserFromRoom(Number(socket.roomId), socket.userId!);
				
				// 방에 사용자가 없으면 방 삭제
				if (room.users.length <= 0) {
					deleteRoom(Number(socket.roomId));
				}
			}
		}
	} catch (error) {
		handleError(socket, error);
	}
};

export default onEnd;
