// cardType = 22
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';
import { CardType, AnimationType } from '../generated/common/enums';
import { sendAnimationNotification } from '../handlers/notification/animation.notification.handler';
import { checkAndEndGameIfNeeded } from '../utils/game.end.util.js';

// 위성 타겟 카드 사용 시 디버프 추가
const cardSatelliteTargetEffect = (
	roomId: number,
	userId: string,
	targetUserId: string,
): boolean => {
	const target = getUserFromRoom(roomId, targetUserId);
	if (!target || !target.character) {
		console.warn(`[SatelliteTarget] 타겟을 찾을 수 없습니다: ${targetUserId}`);
		return false;
	}

	// 이미 디버프가 있는지 확인
	if (target.character.debuffs.includes(CardType.SATELLITE_TARGET)) {
		console.log(`[SatelliteTarget] ${target.nickname}은 이미 위성 타겟 디버프를 가지고 있습니다.`);
		return true;
	}

	// 디버프 추가
	target.character.debuffs.push(CardType.SATELLITE_TARGET);

	try {
		updateCharacterFromRoom(roomId, targetUserId, target.character);
		console.log(`[SatelliteTarget] ${target.nickname}에게 위성 타겟 디버프가 추가되었습니다.`);
		return true;
	} catch (error) {
		console.error(`[SatelliteTarget] Redis 업데이트 중 오류 발생: ${error}`);
		return false;
	}
};
// 위성 타겟 효과 체크 (하루 시작 시 호출)
export const checkSatelliteTargetEffect = async (roomId: number) => {
	const room = getRoom(roomId);
	if (!room || !room.users) {
		console.warn(`[SatelliteTarget] 방을 찾을 수 없습니다: roomId=${roomId}`);
		return room;
	}

	// 위성 타겟 디버프를 가진 유저들 찾기
	const usersWithDebuff = room.users.filter(
		(user) => user.character && user.character.debuffs.includes(CardType.SATELLITE_TARGET),
	);

	console.log(`[SatelliteTarget] 위성 타겟 디버프를 가진 유저 수: ${usersWithDebuff.length}`);

	for (const user of usersWithDebuff) {
		processSatelliteTargetEffect(roomId, user.id, room.users);
	}

	// 업데이트된 방 정보 반환
	return getRoom(roomId);
};

// 개별 유저의 위성 타겟 효과 처리
const processSatelliteTargetEffect = async (roomId: number, userId: string, allUsers: any[]) => {
	const target = getUserFromRoom(roomId, userId);
	if (!target || !target.character) return;

	const probability = 0.03; // 대낮에 번개 맞을 확률
	const damage = 3; // 번개 데미지

	// 지정 확률로 효과 발동
	const isEffectTriggered = Math.random() < probability;

	if (isEffectTriggered) {
		// 효과 발동: 애니메이션 재생 후 HP 데미지 감소
		console.log(`[SatelliteTarget] 효과 발동: ${target.nickname}의 HP ${damage} 감소`);

		// 1. 위성 타겟 애니메이션 전송
		sendAnimationNotification(allUsers, userId, AnimationType.SATELLITE_TARGET_ANIMATION);
		console.log(`[SatelliteTarget] 위성 타겟 애니메이션 전송: ${target.nickname}`);

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

		try {
			updateCharacterFromRoom(roomId, userId, target.character);
			console.log(
				`[SatelliteTarget] 위성 타겟 효과 완료: ${target.nickname}의 HP ${target.character.hp}`,
			);

			// 게임 종료 조건 검사
			await checkAndEndGameIfNeeded(roomId);
		} catch (error) {
			console.error(`[SatelliteTarget] Redis 업데이트 중 오류 발생: ${error}`);
		}
	} else {
		// 효과 미발동: 다음 유저에게 디버프 이전
		console.log(
			`[SatelliteTarget] ${target.nickname}의 위성 타겟 효과 미발동. 다음 유저에게 디버프를 넘깁니다.`,
		);

		// 1. 현재 타겟의 디버프 제거
		const debuffIndex = target.character.debuffs.indexOf(CardType.SATELLITE_TARGET);
		if (debuffIndex > -1) {
			target.character.debuffs.splice(debuffIndex, 1);
		}

		try {
			updateCharacterFromRoom(roomId, userId, target.character);
		} catch (error) {
			console.error(`[SatelliteTarget] 현재 유저 Redis 업데이트 중 오류 발생: ${error}`);
		}

		// 2. 다음 차례에 있는 유저 찾기
		const currentUserIndex = allUsers.findIndex((u) => u.id === userId);
		if (currentUserIndex === -1) return;

		const nextUserIndex = (currentUserIndex + 1) % allUsers.length;
		const nextUserId = allUsers[nextUserIndex].id;
		const nextUser = getUserFromRoom(roomId, nextUserId);

		if (!nextUser || !nextUser.character) return;

		// 3. 찾은 다음 유저에게 디버프 추가
		if (!nextUser.character.debuffs.includes(CardType.SATELLITE_TARGET)) {
			nextUser.character.debuffs.push(CardType.SATELLITE_TARGET);
			try {
				updateCharacterFromRoom(roomId, nextUserId, nextUser.character);
				console.log(`[SatelliteTarget] 위성 타겟 디버프가 ${nextUser.nickname}에게 넘어갔습니다.`);
			} catch (error) {
				console.error(`[SatelliteTarget] 다음 유저 Redis 업데이트 중 오류 발생: ${error}`);
			}
		}
	}
};

export default cardSatelliteTargetEffect;
