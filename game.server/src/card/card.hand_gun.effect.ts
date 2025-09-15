// cardType = 14
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';

const cardHandGunEffect = async (roomId:number, userId:string) : Promise<boolean> =>{
    const user = await getUserFromRoom(roomId, userId);
    
    // 유효성 검증
    if (!user || !user.character) return false; 
    
    // 핸드건 카드 효과: 하루에 사용할 수 있는 빵야!가 두 개로 증가
    // 무기 카드이므로 자신에게만 적용 (targetUserId 무시)
    
    user.character.weapon = 14;
    
    // Redis에 업데이트된 캐릭터 정보 저장
    try {
        await updateCharacterFromRoom(roomId, user.id, user.character);
        return true;
    } catch (error) {
        console.error(`[핸드건] Redis 업데이트 실패:`, error);
        // 에러가 발생해도 함수는 정상적으로 완료됨
        return false;
    }
}

export default cardHandGunEffect;
