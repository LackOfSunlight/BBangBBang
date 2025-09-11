// cardType = 16
import { getUserFromRoom, updateCharacterFromRoom } from "../utils/redis.util.js";

const cardAutoRifleEffect = async (roomId:number, userId:string) =>{
    // 정보값 가져오기
    const user = await getUserFromRoom(roomId, userId);
    // 유효성 검증
    if (!user  || !user.character || !user.character.stateInfo ) return;

    // 무기 장착 처리 & 소지 카드에서의 제거는 호출함수에서 처리
    user.character.weapon = 16; // 16;AUTO_RIFLE 장착

    // BbangCount 초기화 : 기존 무기의 강화점 초기화
    user.character.bbangCount = 1;

    // 현재 가지고 있는 Bbang 카드 개수 파악 후 bbangCount에 반영
    const bbangInHands= user.character.handCards.filter(c => c.type === 1).length;
    user.character.bbangCount = bbangInHands; 


    //// 손에 Bbang 카드가 추가될 경우

    // 수정 정보 갱신
    try {
    await updateCharacterFromRoom(roomId, userId, user.character);
    } catch (error) {
        console.error('[저장 실패]:', error);
    }
}


export default cardAutoRifleEffect;