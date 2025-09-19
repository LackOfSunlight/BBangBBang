import { Room } from '../models/room.model';
import { User } from '../models/user.model';
import { CharacterStateType } from '../generated/common/enums';

export const CheckBigBbangService = (room: Room): Room => {
	const users: User[] = room.users;
	const now = Date.now(); // 현재 시각 (밀리초)

	// BIG_BBANG_TARGET 있는지 확인 (아직 만료 안된 애들만)
	const hasValidTarget = users.some((u) => {
		if (!u.character?.stateInfo) return false;
		const { state, nextStateAt } = u.character.stateInfo;
		if (Number(state) !== CharacterStateType.BIG_BBANG_TARGET) return false;
		if (nextStateAt && Number(nextStateAt) > now) return true; // 아직 유효
		return false;
	});

	for (const u of users) {
		if (!u.character?.stateInfo) continue;

		const { state, nextStateAt } = u.character.stateInfo;

		// nextStateAt 시간이 지났으면 상태 초기화
		if (nextStateAt && Number(nextStateAt) > 0 && Number(nextStateAt) <= now) {
			u.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
			u.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
			u.character.stateInfo.nextStateAt = '0';
			u.character.stateInfo.stateTargetUserId = '0';
		}
	}

	// 타겟이 없으면 슈터도 풀기
	if (!hasValidTarget) {
		for (const u of users) {
			if (u.character?.stateInfo?.state === CharacterStateType.BIG_BBANG_SHOOTER) {
				u.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
				u.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				u.character.stateInfo.nextStateAt = '0';
				u.character.stateInfo.stateTargetUserId = '0';
			}
		}
	}

	return room;
};
