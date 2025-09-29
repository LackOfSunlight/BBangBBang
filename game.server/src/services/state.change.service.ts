import { CharacterStateType } from '../generated/common/enums';
import { User } from '../Models/user.model';

/**
 *
 * @param user  상태 변경할 유저 객체
 * @param stateType 현재 상태 정의
 * @param nextState 다음 상태 정의
 * @param nextAt 다음 상태로 넘어갈 시간
 * @param targetId 선택한 타켓 아이디
 * @returns
 */
export const stateChangeService = (
	user: User,
	stateType: CharacterStateType = CharacterStateType.NONE_CHARACTER_STATE,
	nextState: CharacterStateType = CharacterStateType.NONE_CHARACTER_STATE,
	nextAt: number = 0,
	targetId: string = '0',
) => {
	if (!user.character || !user.character.stateInfo) return;

	user.character.stateInfo.state = stateType;
	user.character.stateInfo.nextState = nextState;
	user.character.stateInfo.nextStateAt = `${Date.now() + nextAt * 1000}`;
	user.character.stateInfo.stateTargetUserId = targetId;
};
