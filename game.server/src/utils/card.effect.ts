// utils/game.effect.ts
import { GameSocket } from "../type/game.socket.js";
import { CardType, GlobalFailCode } from "../generated/common/enums.js";
import { GamePacket } from "../generated/gamePacket.js";
import { setUseCardResponse, setUseCardNotification } from "../handlers/request/use.card.request.handler.js";

// 간단한 유저 상태 예시
interface UserInfo {
    id: string;
    hp: number;
    handCards: { rcode: string }[];
}

// 빵야 카드 효과 적용 함수
export const applyCardEffect = (
    userMap: Map<string, UserInfo>, // 전체 유저 상태
    sourceUserId: string,
    targetUserId: string
): { success: boolean; removedCard?: string; hpChange?: number; failCode?: GlobalFailCode } => {
    
    const targetUser = userMap.get(targetUserId);
    const sourceUser = userMap.get(sourceUserId);

    if (!targetUser) return { success: false, failCode: GlobalFailCode.INVALID_REQUEST };

    // 1. 방어 카드 확인 (C# 코드 참고)
    const defCardIndex = targetUser.handCards.findIndex(c => c.rcode === "DEF_BBANG"); // 예시 방어 카드 코드
    if (defCardIndex !== -1) {
        const removedCard = targetUser.handCards.splice(defCardIndex, 1)[0].rcode;
        return { success: true, removedCard, hpChange: 0 };
    }

    // 2. 방어 카드 없으면 HP 감소
    targetUser.hp -= 1;
    return { success: true, hpChange: -1 };
};
