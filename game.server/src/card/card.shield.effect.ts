// cardType = 3
import { setDefaultHighWaterMark } from 'stream';
import { CardType, CharacterStateType, CharacterType } from '../generated/common/enums.js';
import { CheckBigBbangService } from '../services/bigbbang.check.service.js';
import { getRoom, saveRoom } from '../utils/redis.util.js';
import { User } from '../models/user.model.js';



const cardShieldEffect = async (roomId: number, userId: string, targetUserId: string) : Promise<boolean> => {
	let room = await getRoom(roomId);

	if (!room) return false;

	const user = room.users.find((u) => u.id === userId);

	if (!user?.character) {
		console.log('유저에 캐릭터 정보가 없다');
		return false;
	}
	const stateInfo = user?.character?.stateInfo;

	if (stateInfo) {
		if (stateInfo.state === CharacterStateType.BBANG_TARGET) {
			const shooter = room.users.find((u) => u.id === user.character?.stateInfo?.stateTargetUserId);

			const isShark = shooter?.character?.characterType === CharacterType.SHARK;
			const hasLaser = shooter?.character?.equips.includes(CardType.LASER_POINTER);

			let requiredShields = 0;
			if (isShark) requiredShields += 1;
			if (hasLaser) requiredShields += 1;
			if (isShark && hasLaser) requiredShields += 1;

			if (requiredShields > 0) {
				removeShields(user, requiredShields);
			}

			stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
			stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
			stateInfo.nextStateAt = '0';
			stateInfo.stateTargetUserId = '0';

			if (shooter?.character?.stateInfo) {
				shooter.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
				shooter.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				shooter.character.stateInfo.nextStateAt = '0';
				shooter.character.stateInfo.stateTargetUserId = '0';
				shooter.character.bbangCount += 1;
			}
		} else {
			stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
			stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
			stateInfo.nextStateAt = '0';
			stateInfo.stateTargetUserId = '0';
		}
	}

	room = await CheckBigBbangService(room);

	await saveRoom(room);
	return true;
};

const removeShields = (user: User, count: number) => {
	const shieldCard = user.character?.handCards.find((c) => c.type === CardType.SHIELD);

	if (!shieldCard) return;

	if (shieldCard.count > count) {
		shieldCard.count -= count;
	} else {
		user.character!.handCards = user.character!.handCards.filter((c) => c.type !== CardType.SHIELD);
	}
};

export default cardShieldEffect;
