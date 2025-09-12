// cardType = 22
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util';
import { CardType, AnimationType } from '../generated/common/enums';
import { sendAnimationNotification } from '../handlers/notification/animation.notification.handler';

const cardSatelliteTargetEffect = async (roomId: number, userId: string, targetUserId: string) => {
	const target = await getUserFromRoom(roomId, targetUserId);
	// 유효성 검증
	if (!target || !target.character) return;

	const isEffectTriggered = Math.random() < 0.03;
	if (isEffectTriggered) {
		// 효과 발동: 애니메이션 재생 후 HP 3 감소
		console.log(`위성 타겟 효과 발동: ${target.nickname}의 HP 3 감소`);
		
		// 1. 방 정보 가져오기
		const room = await getRoom(roomId);
		if (!room || !room.users) {
			console.warn(`[SatelliteTarget] 방을 찾을 수 없습니다: roomId=${roomId}`);
			return;
		}
		
		// 2. 위성 타겟 애니메이션 전송
		sendAnimationNotification(room.users, targetUserId, AnimationType.SATELLITE_TARGET_ANIMATION);
		console.log(`[SatelliteTarget] 위성 타겟 애니메이션 전송: ${target.nickname}`);
		
		// 3. 애니메이션 재생 시간 대기 (2초)
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		// 4. 실제 효과 적용
		target.character.hp -= 3;
		if (target.character.hp < 0) {
			target.character.hp = 0;
		}
		await updateCharacterFromRoom(roomId, targetUserId, target.character);
		
		console.log(`[SatelliteTarget] 위성 타겟 효과 완료: ${target.nickname}의 HP ${target.character.hp}`);
	} else {
		// 효과 미발동: 다음 유저에게 디버프 이전
		console.log('위성 타겟 효과 미발동. 다음 유저에게 디버프를 넘깁니다.');
		try {
			const room = await getRoom(roomId);
			if (!room || !room.users) return;

			// 1. 현재 타겟의 디버프 제거
			const debuffIndex = target.character.debuffs.indexOf(CardType.SATELLITE_TARGET);
			if (debuffIndex > -1) {
				target.character.debuffs.splice(debuffIndex, 1);
			}
			await updateCharacterFromRoom(roomId, targetUserId, target.character);

			// 2. 다음 유저 찾기
			const currentUserIndex = room.users.findIndex((u) => u.id === targetUserId);
			if (currentUserIndex === -1) return;

			const nextUserIndex = (currentUserIndex + 1) % room.users.length;
			const nextUserId = room.users[nextUserIndex].id;
			const nextUser = await getUserFromRoom(roomId, nextUserId);

			if (!nextUser || !nextUser.character) return;

			// 3. 다음 유저에게 디버프 추가
			if (!nextUser.character.debuffs.includes(CardType.SATELLITE_TARGET)) {
				nextUser.character.debuffs.push(CardType.SATELLITE_TARGET);
			}
			await updateCharacterFromRoom(roomId, nextUserId, nextUser.character);

			console.log(`위성 타겟 디버프가 ${nextUser.nickname}에게 넘어갔습니다.`);
		} catch (error) {
			console.error(`위성 타겟 디버프 이전 중 오류 발생: ${error}`);
		}
	}
};

export default cardSatelliteTargetEffect;
