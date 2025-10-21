import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { CharacterStateType } from '@core/generated/common/enums';

export const CheckGuerrillaService = (room: Room): Room => {
	const users: User[] = room.users;
	const now = Date.now(); // 현재 시각 (밀리초)

	// GUERRILLA_TARGET 있는지 확인 (아직 만료 안된 애들만)
	const hasValidTarget = users.some((u) => {
		if (!u.character?.stateInfo) return false;
		const { state, nextStateAt } = u.character.stateInfo;
		if (Number(state) !== CharacterStateType.GUERRILLA_TARGET) return false;
		// if (nextStateAt && Number(nextStateAt) > now) return true; // 아직 유효
		return false;
	});

	// 타겟이 없으면 슈터도 풀기
	if (!hasValidTarget) {
		for (const u of users) {
			if (u.character?.stateInfo?.state === CharacterStateType.GUERRILLA_SHOOTER) {
				u.character.changeState();
			}
		}
	}

	return room;
};
