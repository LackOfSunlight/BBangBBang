// cardType = 1
import { getUserFromRoom, updateCharacterFromRoom } from "../utils/redis.util.js";

const cardBbangEffect = async (roomId:number, userId:string, targetUserId:string) =>{
    const user = await getUserFromRoom(roomId, userId);
    const target = await getUserFromRoom(roomId, targetUserId);
    // 유효성 검증
    if (!user || !target || !target.character) return; 

    // if (!target.character) return;

    // 1. 방어 카드 확인 (C# 코드 참고)
    // const defCardIndex = target.character.handCards.findIndex(c => c.rcode === "Shield"); 
    // if (defCardIndex !== -1) {
    //     const removedCard = target.character.handCards.splice(defCardIndex, 1)[0].rcode;
    //     return { success: true, removedCard, hpChange: 0 };
    // }

    // 2. 방어 카드 없으면 HP 감소
    target.character.hp -= 1;
    const result = await updateCharacterFromRoom(roomId, targetUserId, target.character);
    
}


export default  cardBbangEffect;