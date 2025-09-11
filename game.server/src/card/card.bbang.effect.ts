// cardType = 1
import { getUserFromRoom, updateCharacterFromRoom } from "../utils/redis.util.js";
import { CharacterStateType } from "../generated/common/enums.js";
import { getRoom } from "../utils/redis.util.js";
import { WeaponDamageEffect } from "../utils/weapon.util.js";
import { CardType } from "../generated/common/enums.js";

const cardBbangEffect = async (roomId:number, userId:string, targetUserId:string) =>{
    // 정보값 가져오기
    const user = await getUserFromRoom(roomId, userId);
    const target = await getUserFromRoom(roomId, targetUserId);
    const room = await getRoom(roomId);
    
    // 유효성 검증

    if (!room) {
        console.log('방이 존재하지 않습니다.');
        return;}
    
    if (!user || !user.character || !user.character.stateInfo ) {
        console.log('사용자 정보가 존재하지 않습니다');
        return;
    }

    if(  !target || !target.character || !target.character.stateInfo){
        console.log('타깃 유저의 정보가 존재하지 않습니다 ');
        return;
    }

    // 타겟 유저가 사망 상태라면 불발 처리
    if (target.character.hp <= 0) {
        console.log('타깃 유저의 체력이 이미 0 입니다.')    
        return;
    }
    if (!user || !target || !user.character || !target.character) return; 

    // // 자동 쉴드 방어 로직
    // if (target.character.equips.includes(CardType.AUTO_SHIELD)) {
    //     if (Math.random() < 0.25) { // 25% 확률로 방어
    //         // 방어에 성공했으므로 여기서 함수를 종료합니다.
    //         // 만약 방어 성공 시 카드를 버려야 한다면, 여기서 equips 배열에서 제거하는 로직을 추가해야 합니다.
    //         return;
    //     }
    // }
    // 타겟에서 처리하도록 변경

    // 상태 설정 
    user.character.stateInfo.state = CharacterStateType.BBANG_SHOOTER; // 빵야 카드 사용자는 BBANG_SHOOTER 상태가 되고
    user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
    user.character.stateInfo.nextStateAt = `${Date.now()  + 10000}`; //ms
    user.character.stateInfo.stateTargetUserId = targetUserId; // 빵야 카드 사용자는 targetId에 대상자 ID를 기록

    target.character.stateInfo.state = 2; // 빵야 카드 대상자는 BBANG_TARGET 상태가 됩니다
    target.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
    target.character.stateInfo.nextStateAt = `${Date.now()  + 10000}`; //ms
    target.character.stateInfo.stateTargetUserId = userId;



    // 수정 정보 갱신
    await updateCharacterFromRoom(roomId, userId, user.character)
    await updateCharacterFromRoom(roomId, targetUserId, target.character);
    
}


export default  cardBbangEffect;