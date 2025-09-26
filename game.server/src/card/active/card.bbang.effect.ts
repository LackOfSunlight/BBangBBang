// cardType = 1
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { CheckGuerrillaService } from '../../services/guerrilla.check.service';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import roomManger from '../../managers/room.manager';
import { cardManager } from '../../managers/card.manager';

const cardBbangEffect = (room: Room, user: User, target: User): boolean => {
	// 정보값 가져오기
	const nowTime = Date.now();

	// 유효성 검증
	if (!room) {
		console.error('[BBANG]방이 존재하지 않습니다.');
		return false;
	}
	if (!user || !user.character || !user.character.stateInfo) {
		console.error('[BBANG]사용자 정보가 존재하지 않습니다');
		return false;
	}
	if (!target || !target.character || !target.character.stateInfo) {
		console.error('[BBANG]타깃 유저의 정보가 존재하지 않습니다 ');
		return false;
	}

	// 타겟 유저가 사망 상태라면 불발 처리
	if (target.character.hp <= 0) {
		console.error('[BBANG]타깃 유저의 체력이 이미 0 입니다.');
		return false;
	}

	if (target.character.stateInfo.state === CharacterStateType.CONTAINED) {
		console.error('[BBANG]타킷 유저의 상태가 감옥 상태입니다.');
		return false;
	}

	cardManager.removeCard(user, room, CardType.BBANG);
	if (user.character.stateInfo.state === CharacterStateType.NONE_CHARACTER_STATE) {
		// 상태 설정
		user.character.stateInfo.state = CharacterStateType.BBANG_SHOOTER; // 빵야 카드 사용자는 BBANG_SHOOTER 상태가 되고
		user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
		user.character.stateInfo.nextStateAt = `${nowTime + 10}`; //ms
		user.character.stateInfo.stateTargetUserId = target.id; // 빵야 카드 사용자는 targetId에 대상자 ID를 기록

		target.character.stateInfo.state = CharacterStateType.BBANG_TARGET; // 빵야 카드 대상자는 BBANG_TARGET 상태가 됩니다
		target.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
		target.character.stateInfo.nextStateAt = `${nowTime + 10}`; //ms
		target.character.stateInfo.stateTargetUserId = user.id;
	} else if (user.character.stateInfo.state === CharacterStateType.DEATH_MATCH_TURN_STATE) {
		// 상태 설정
		user.character.stateInfo.state = CharacterStateType.DEATH_MATCH_STATE;
		user.character.stateInfo.nextState = CharacterStateType.DEATH_MATCH_TURN_STATE;
		user.character.stateInfo.nextStateAt = `${nowTime + 10}`; //ms
		user.character.stateInfo.stateTargetUserId = target.id;

		target.character.stateInfo.state = CharacterStateType.DEATH_MATCH_TURN_STATE;
		target.character.stateInfo.nextState = CharacterStateType.DEATH_MATCH_STATE;
		target.character.stateInfo.nextStateAt = `${nowTime + 10}`; //ms
		target.character.stateInfo.stateTargetUserId = user.id;
	} else if (user.character.stateInfo.state === CharacterStateType.GUERRILLA_TARGET) {
		user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
		user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
		user.character.stateInfo.nextStateAt = '0'; //ms
		user.character.stateInfo.stateTargetUserId = '0';

		const updatedRoom = roomManger.getRoom(room.id);
		if (updatedRoom) CheckGuerrillaService(updatedRoom);
		return true;
	}
	return true;
};

export default cardBbangEffect;
