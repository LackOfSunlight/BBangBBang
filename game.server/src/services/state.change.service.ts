import { CharacterStateType } from '../generated/common/enums';
import { User } from '../models/user.model';

export const stateChangeService = (
    user: User,
	stateType: CharacterStateType,
    nextState: CharacterStateType,
	nextAt: number,
    targetId: string,
) => {
	const nowTime = Date.now();

    if(!user.character || !user.character.stateInfo) return;

    user.character.stateInfo.state = stateType;
	user.character.stateInfo.nextState = nextState;
	user.character.stateInfo.nextStateAt = `${nowTime + nextAt}`;
	user.character.stateInfo.stateTargetUserId = targetId;
};
