// cardType = 1
import { getUserFromRoom, updateCharacterFromRoom } from "../utils/redis.util.js";
import { WeaponDamageEffect } from "../utils/weapon.util.js";
import { CardType } from "../generated/common/enums.js";

const cardBbangEffect = async (roomId:number, userId:string, targetUserId:string) =>{
    const user = await getUserFromRoom(roomId, userId);
    const target = await getUserFromRoom(roomId, targetUserId);
    // 유효성 검증
    if (!user || !target || !user.character || !target.character) return; 

    // 자동 쉴드 방어 로직
    if (target.character.equips.includes(CardType.AUTO_SHIELD)) {
        if (Math.random() < 0.25) { // 25% 확률로 방어
            // 방어에 성공했으므로 여기서 함수를 종료합니다.
            // 만약 방어 성공 시 카드를 버려야 한다면, 여기서 equips 배열에서 제거하는 로직을 추가해야 합니다.
            return;
        }
    }

    // 1. 방어 카드 확인 (C# 코드 참고)
    // const defCardIndex = target.character.handCards.findIndex(c => c.rcode === "Shield"); 
    // if (defCardIndex !== -1) {
    //     const removedCard = target.character.handCards.splice(defCardIndex, 1)[0].rcode;
    //     return { success: true, removedCard, hpChange: 0 };
    // }

    // 가장 앞에 있는 Bbang 카드 제거
    const BbangIndex = user.character.handCards.findIndex(c => c.type === 1);
    if (BbangIndex !== -1) 
        user.character.handCards.splice(BbangIndex, 1); 
    else return; // BbangIndex = -1 일 경우 ; 아무 변화 없이 종료

    // 기본 데미지에 무기 효과 적용
    const damage = WeaponDamageEffect(1, user.character);

    // 2. 방어 카드 없으면 HP 감소
    target.character.hp -= damage; 

    // 수정 정보 갱신
    await updateCharacterFromRoom(roomId, targetUserId, target.character);
    
}


export default  cardBbangEffect;