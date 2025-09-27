// cardType = 1
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { CheckGuerrillaService } from '../../services/guerrilla.check.service';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { Character } from '../../models/character.model';

const cardBbangEffect = (room: Room, user: User, target: User): boolean => {
	// 정보값 가져오기
	const nowTime = Date.now();

	// 유효성 검증
	if (!user.character || !user.character.stateInfo) {
		console.error('[BBANG]사용자 정보가 존재하지 않습니다');
		return false;
	}
	if (!target.character || !target.character.stateInfo) {
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

	room.removeCard(user, CardType.BBANG);
	if (user.character.stateInfo.state === CharacterStateType.NONE_CHARACTER_STATE) {
		// 상태 설정
		console.log('character instanceof Character?', user.character instanceof Character);
		console.log('constructor:', user.character?.constructor?.name);
		user.character.changeState(
			CharacterStateType.BBANG_SHOOTER,
			CharacterStateType.NONE_CHARACTER_STATE,
			10,
			target.id,
		);

		target.character.changeState(
			CharacterStateType.BBANG_TARGET,
			CharacterStateType.NONE_CHARACTER_STATE,
			10,
			user.id,
		);
	} else if (user.character.stateInfo.state === CharacterStateType.DEATH_MATCH_TURN_STATE) {
		// 상태 설정

		user.character.changeState(
			CharacterStateType.DEATH_MATCH_STATE,
			CharacterStateType.DEATH_MATCH_TURN_STATE,
			10,
			target.id,
		);

		target.character.changeState(
			CharacterStateType.DEATH_MATCH_TURN_STATE,
			CharacterStateType.DEATH_MATCH_STATE,
			10,
			user.id,
		);
	} else if (user.character.stateInfo.state === CharacterStateType.GUERRILLA_TARGET) {
		user.character.changeState();

		CheckGuerrillaService(room);

		return true;
	}
	return true;
};

export default cardBbangEffect;
