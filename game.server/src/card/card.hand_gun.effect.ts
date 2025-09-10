// cardType = 14
import { getUserFromRoom, updateCharacterFromRoom } from "../utils/redis.util.js";

const cardHandGunEffect = async (roomId:number, userId:string, targetUserId:string) =>{
    const user = await getUserFromRoom(roomId, userId);
    const target = await getUserFromRoom(roomId, targetUserId);
    
    // 유효성 검증
    if (!user || !user.character) return; 
    
    // 핸드건 카드 효과: 무기 장착
    // targetUserId가 있으면 해당 플레이어, 없으면 자신에게 무기 장착
    const targetUser = targetUserId && target ? target : user;
    
    // 대상 유저의 캐릭터가 존재하는지 확인
    if (!targetUser.character) {
        console.warn(`[핸드건] 대상 유저 ${targetUser.nickname}의 캐릭터 정보가 없습니다.`);
        return;
    }
    
    // 이미 핸드건을 장착하고 있는지 확인
    if (targetUser.character.weapon === 14) { // 14 = HAND_GUN
        console.log(`[핸드건] ${targetUser.nickname}은 이미 핸드건을 장착하고 있습니다.`);
        return;
    }
    
    // 이전 무기 정보 저장
    const previousWeapon = targetUser.character.weapon;
    
    // 핸드건 장착 (무기 ID: 14)
    targetUser.character.weapon = 14;
    
    // Redis에 업데이트된 캐릭터 정보 저장
    try {
        await updateCharacterFromRoom(roomId, targetUser.id, targetUser.character);
        console.log(`[핸드건] ${targetUser.nickname}이 핸드건을 장착했습니다. (이전 무기: ${previousWeapon})`);
    } catch (error) {
        console.error(`[핸드건] Redis 업데이트 실패:`, error);
        // 에러가 발생해도 함수는 정상적으로 완료됨
    }
}


export default cardHandGunEffect;