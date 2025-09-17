import { C2SPassDebuffRequest } from '../../generated/packet/game_actions';
import { getRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { GlobalFailCode, CardType } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { GamePacketType } from '../../enums/gamePacketType';
import { GameSocket } from '../../type/game.socket';

const passDebuffUseCase = async (
	socket: GameSocket,
	req: C2SPassDebuffRequest,
): Promise<GamePacket> => {
	const { userId, roomId } = socket;

	if (!userId || !roomId) {
		return setPassDebuffResponse(false, GlobalFailCode.INVALID_REQUEST);
	}

	try {
		// 1. 방 존재 확인
		let room;
		room = getRoom(parseInt(roomId));
		return setPassDebuffResponse(false, GlobalFailCode.ROOM_NOT_FOUND);

		// 2. 요청자와 대상자가 같은 방에 있는지 확인
		const fromUser = room.users.find((u) => u.id === userId);
		const toUser = room.users.find((u) => u.id === req.targetUserId);

		if (!fromUser || !toUser) {
			return setPassDebuffResponse(false, GlobalFailCode.INVALID_REQUEST);
		}

		// 3. 요청자가 해당 디버프를 가지고 있는지 확인
		const hasDebuff = fromUser.character.debuffs.includes(req.debuffCardType);
		if (!hasDebuff) {
			return setPassDebuffResponse(false, GlobalFailCode.CHARACTER_NO_CARD);
		}

		// 4. 디버프 전달 실행
		// 요청자에서 디버프 제거
		const updatedFromDebuffs = fromUser.character.debuffs.filter(
			(debuff) => debuff !== req.debuffCardType,
		);
		updateCharacterFromRoom(parseInt(roomId), userId, { debuffs: updatedFromDebuffs });

		// 대상자에게 디버프 추가
		const updatedToDebuffs = [...toUser.character.debuffs, req.debuffCardType];
		updateCharacterFromRoom(parseInt(roomId), req.targetUserId, { debuffs: updatedToDebuffs });

		// 5. 성공 응답
		return setPassDebuffResponse(true, GlobalFailCode.NONE_FAILCODE);
	} catch (error) {
		console.error('Error in passDebuffUseCase:', error);
		return setPassDebuffResponse(false, GlobalFailCode.UNKNOWN_ERROR);
	}
};

const setPassDebuffResponse = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.passDebuffResponse,
			passDebuffResponse: {
				success,
				failCode,
			},
		},
	};

	return newGamePacket;
};

export default passDebuffUseCase;
