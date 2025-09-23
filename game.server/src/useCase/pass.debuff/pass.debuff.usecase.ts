import { C2SPassDebuffRequest } from '../../generated/packet/game_actions';
import { getRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { GameSocket } from '../../type/game.socket';
import { passDebuffResponseForm } from '../../factory/packet.pactory';

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
		const room = getRoom(roomId);
	} catch (error) {
		// 방을 찾을 수 없는 경우
		return passDebuffResponseForm(false, GlobalFailCode.ROOM_NOT_FOUND);
	}

	try {
		// 1. 방 존재 확인 (재시도)
		const room = getRoom(roomId);

		// 2. 요청자와 대상자가 같은 방에 있는지 확인
		const fromUser = room.users.find((u) => u.id === userId);
		const toUser = room.users.find((u) => u.id === req.targetUserId);

		if (!fromUser || !toUser) {
			return passDebuffResponseForm(false, GlobalFailCode.INVALID_REQUEST);
		}

		// 3. 요청자가 해당 디버프를 가지고 있는지 확인
		const hasDebuff = fromUser.character!.debuffs.includes(req.debuffCardType);
		if (!hasDebuff) {
			return passDebuffResponseForm(false, GlobalFailCode.CHARACTER_NO_CARD);
		}

		// 4. 디버프 전달 실행
		// 요청자에서 디버프 제거
		const updatedFromDebuffs = fromUser.character!.debuffs.filter(
			(debuff) => debuff !== req.debuffCardType,
		);
		updateCharacterFromRoom(roomId, userId, { debuffs: updatedFromDebuffs });

		// 대상자에게 디버프 추가
		const updatedToDebuffs = [...toUser.character!.debuffs, req.debuffCardType];
		updateCharacterFromRoom(roomId, req.targetUserId, { debuffs: updatedToDebuffs });

		// 5. 성공 응답
		return passDebuffResponseForm(true, GlobalFailCode.NONE_FAILCODE);
	} catch (error) {
		console.error('Error in passDebuffUseCase:', error);
		return passDebuffResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
	}
};



export default passDebuffUseCase;
