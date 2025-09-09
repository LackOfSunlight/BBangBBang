import { CardType } from "../generated/common/enums.js";
import { UserData } from "../generated/common/types.js";
import { getUserFromRoom, updateCharacterFromRoom } from "./redis.util.js";

// 카드 효과 적용 함수
export async function applyCardEffect(roomId:number, CardType: string, userId: string, targetUserId: string) {
  const user = await getUserFromRoom(roomId, userId);
  
  const target = await getUserFromRoom(roomId, targetUserId);
  if (!user || !target) return; 
  

  if(user.character){
  const RoomUpdate = await updateCharacterFromRoom(roomId, userId, user.character);}


  if (!user || !target) {
    console.log('User not found');
    return;
  }

  if (!target.character) return;

  switch (CardType) {
    case 'Bbang':
       // 1. 방어 카드 확인 (C# 코드 참고)
        // const defCardIndex = target.character.handCards.findIndex(c => c.rcode === "Shield"); 
        // if (defCardIndex !== -1) {
        //     const removedCard = target.character.handCards.splice(defCardIndex, 1)[0].rcode;
        //     return { success: true, removedCard, hpChange: 0 };
        // }

        // 2. 방어 카드 없으면 HP 감소
        target.character.hp -= 1;
        return { success: true, hpChange: -1 };
        break;
    default:
      console.log('Unknown card type');
  }
}

// 테스트
//applyCardEffect('Bbang', 'user1', 'user2');
//console.log(users);
