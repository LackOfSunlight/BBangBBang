import { C2SPassDebuffRequest } from '../../generated/packet/game_actions';
import { GlobalFailCode, CardType, WarningType } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { GamePacket } from '../../generated/gamePacket';
import { GameSocket } from '../../type/game.socket';
import { passDebuffResponseForm, warnNotificationPacketForm } from '../../converter/packet.form';
import { bombManager } from '../../services/bomb.service';
//import { createUserUpdateNotificationPacket } from '../use.card/use.card.usecase';
import { userUpdateNotificationPacketForm } from '../../converter/packet.form';
import { broadcastDataToRoom } from '../../sockets/notification';
import roomManger from '../../managers/room.manger';

const passDebuffUseCase = async (
	socket: GameSocket,
	req: C2SPassDebuffRequest,
): Promise<GamePacket> => {
	const { userId, roomId } = socket;

	if (!userId || !roomId) {
		return passDebuffResponseForm(false, GlobalFailCode.INVALID_REQUEST);
	}

	try {
		// 1. 방 존재 확인
		const room = roomManger.getRoom(roomId);
	} catch (error) {
		// 방을 찾을 수 없는 경우
		return passDebuffResponseForm(false, GlobalFailCode.ROOM_NOT_FOUND);
	}

	try {
		// 1. 방 존재 확인 (재시도)
		const room = roomManger.getRoom(roomId);

		// 2. 요청자와 대상자가 같은 방에 있는지 확인
		const fromUser = room.users.find((u) => u.id === userId);
		const toUser = room.users.find((u) => u.id === req.targetUserId);
		if (!fromUser || !toUser) {
			return passDebuffResponseForm(false, GlobalFailCode.INVALID_REQUEST);
		}

		// 3. 요청자가 해당 디버프를 가지고 있는지 확인
		const hasDebuff = fromUser.character!!.debuffs.includes(CardType.BOMB);
		// 4. 대상자가 이미 해당 디버프를 가지고 있는지 확인
		const alreadyDebuffed = toUser.character!.debuffs.includes(CardType.BOMB);
		if (!hasDebuff || alreadyDebuffed) {
			// 사용자는 해당 디버프 소지 , 대상자는 해당 디버프가 없어야 실행
			return passDebuffResponseForm(false, GlobalFailCode.CHARACTER_NO_CARD);
		}

		// 5. 디버프 전달 실행
		const idx = fromUser.character!.debuffs.findIndex((c) => c === CardType.BOMB);
		if (idx !== undefined && idx >= 0) {
			fromUser.character!.debuffs.splice(idx, 1);
		}
		toUser.character!.debuffs.push(CardType.BOMB);

		const timerKey = `${roomId}:${fromUser.id}`;
		const explosionTime = bombManager.clearTimer(timerKey);
		bombManager.startBombTimer(room, toUser, explosionTime);

		const remainTime = explosionTime - Date.now();
		console.log(
			`[BOMB] 폭탄이 ${fromUser.nickname} → ${toUser.nickname} 에게 전달됨 (남은 시간 ${remainTime}ms)`,
		);

		// 6. 유저 정보 업데이트
		// updateCharacterFromRoom(roomId, fromUser.id, fromUser.character!);
		// updateCharacterFromRoom(roomId, toUser.id, toUser.character!);

		const updateClient = userUpdateNotificationPacketForm(room.users);
		broadcastDataToRoom(room.users, updateClient, GamePacketType.userUpdateNotification);
		// 남은 시간을 넘기기 위해 추가
		const passBomb = warnNotificationPacketForm(WarningType.BOMB_WANING, `${explosionTime}`);
		broadcastDataToRoom(room.users, passBomb, GamePacketType.warningNotification);
		// 6. 성공 응답
		return passDebuffResponseForm(true, GlobalFailCode.NONE_FAILCODE);
	} catch (error) {
		console.error('Error in passDebuffUseCase:', error);
		return passDebuffResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
	}
};

export default passDebuffUseCase;
