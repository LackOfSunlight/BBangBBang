// cardType = 22
import { CardType, AnimationType } from '../../generated/common/enums';
import { playAnimationHandler } from '../../handlers/play.animation.handler';
import { checkAndEndGameIfNeeded } from '../../services/game.end.service';
import { cardManager } from '../../managers/card.manager';
import { User } from '../../models/user.model';
import { Room } from '../../models/room.model';
import roomManger from '../../managers/room.manger';

// 위성 타겟 카드 사용 시 디버프 추가
const cardSatelliteTargetEffect = (room: Room, user: User,  targetUser: User): boolean => {
	if (!targetUser.character) {
		return false;
	}

	// 이미 디버프가 있는지 확인
	if (targetUser.character.debuffs.includes(CardType.SATELLITE_TARGET)) {
		return true;
	}

	cardManager.removeCard(user, room, CardType.SATELLITE_TARGET);

	// 디버프 추가
	targetUser.character.debuffs.push(CardType.SATELLITE_TARGET);

	console.log(`[위성 타겟] ${user.nickname}님이 위성타겟을 사용했습니다.`);
	return true;
};

// 위성 타겟 효과 체크 (하루 시작 시 호출)
export const checkSatelliteTargetEffect = async (room: Room) => {
	if (!room || !room.users) {
		return false;
	}

	// 위성 타겟 디버프를 가진 유저들 찾기
	const usersWithDebuff = room.users.filter(
		(user) => user.character && user.character.debuffs.includes(CardType.SATELLITE_TARGET),
	);

	await Promise.all(
		usersWithDebuff.map((user) => processSatelliteTargetEffect(user, room, room.users)),
	);
};

// 개별 유저의 위성 타겟 효과 처리
const processSatelliteTargetEffect = async (user: User, room: Room, allUsers: any[]) => {
	try {
		const target = roomManger.getUserFromRoom(room.id, user.id);
		if (!target || !target.character) return;

		const probability = 0.03; // 대낮에 번개 맞을 확률
		const damage = 3; // 번개 데미지

		// 지정 확률로 효과 발동
		const isEffectTriggered = Math.random() < probability;

		if (isEffectTriggered) {
			// 효과 발동: 애니메이션 재생 후 HP 데미지 감소

			// 1. 위성 타겟 애니메이션 전송
			playAnimationHandler(allUsers, user.id, AnimationType.SATELLITE_TARGET_ANIMATION);

			// 2. 애니메이션 재생 시간 대기 (2초)
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// 3. 실제 효과 적용
			target.character.hp -= damage;
			if (target.character.hp < 0) {
				target.character.hp = 0;
			}

			// 4. 디버프 제거 (효과 발동 후 제거)
			const debuffIndex = target.character.debuffs.indexOf(CardType.SATELLITE_TARGET);
			if (debuffIndex > -1) {
				target.character.debuffs.splice(debuffIndex, 1);
			}

			// 게임 종료 조건 검사
			await checkAndEndGameIfNeeded(room.id);
		} else {
			// 효과 미발동: 다음 유저에게 디버프 이전

			// 1. 현재 타겟의 디버프 제거
			const debuffIndex = target.character.debuffs.indexOf(CardType.SATELLITE_TARGET);
			if (debuffIndex > -1) {
				target.character.debuffs.splice(debuffIndex, 1);
			}

			roomManger.updateCharacterFromRoom(room.id, user.id, target.character);

			// 2. 다음 차례에 있는 유저 찾기
			const currentUserIndex = allUsers.findIndex((u) => u.id === user.id);
			if (currentUserIndex === -1) return;

			const nextUserIndex = (currentUserIndex + 1) % allUsers.length;
			const nextUserId = allUsers[nextUserIndex].id;
			const nextUser = roomManger.getUserFromRoom(room.id, nextUserId);

			if (!nextUser || !nextUser.character) return;

			// 3. 찾은 다음 유저에게 디버프 추가
			if (!nextUser.character.debuffs.includes(CardType.SATELLITE_TARGET)) {
				nextUser.character.debuffs.push(CardType.SATELLITE_TARGET);
			}
		}
	} catch (error) {
		// 에러 처리
	}
};

export default cardSatelliteTargetEffect;
