// cardType = 1
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';
import { WeaponDamageEffect } from '../utils/weapon.util.js';

const cardBbangEffect = async (roomId: number, userId: string, targetUserId: string) => {
	const user = await getUserFromRoom(roomId, userId);
	const target = await getUserFromRoom(roomId, targetUserId);
	// 유효성 검증
	if (!user || !target || !user.character || !target.character) return;

	// 1. 방어 카드 확인 (C# 코드 참고)
	// const defCardIndex = target.character.handCards.findIndex(c => c.rcode === "Shield");
	// if (defCardIndex !== -1) {
	//     const removedCard = target.character.handCards.splice(defCardIndex, 1)[0].rcode;
	//     return { success: true, removedCard, hpChange: 0 };
	// }

	// 가장 앞에 있는 Bbang 카드 제거
	const BbangIndex = user.character.handCards.findIndex((c) => c.type === 1);
	if (BbangIndex !== -1) user.character.handCards.splice(BbangIndex, 1);
	else return; // BbangIndex = -1 일 경우 ; 아무 변화 없이 종료

	// 기본 데미지에 무기 효과 적용
	const damage = WeaponDamageEffect(1, user.character);

	// 2. 방어 카드 없으면 HP 감소
	target.character.hp -= damage;

	// 수정 정보 갱신
	await updateCharacterFromRoom(roomId, targetUserId, target.character);
};

export default cardBbangEffect;
