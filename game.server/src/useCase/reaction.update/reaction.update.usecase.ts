import { GameSocket } from "../../type/game.socket";

import { GamePacketType } from "../../enums/gamePacketType";
import {ReactionType,
        GlobalFailCode,  
        CharacterStateType, 
        CardType, 
        AnimationType
        } from "../../generated/common/enums";

import { getRoom, saveRoom, updateCharacterFromRoom } from "../../utils/room.utils";
import { weaponDamageEffect } from "../../utils/weapon.util";
import { CheckBigBbangService } from "../../services/bigbbang.check.service";
import { CheckGuerrillaService } from "../../services/guerrilla.check.service";

import { playAnimationHandler } from "../../handlers/play.animation.handler";

import { broadcastDataToRoom } from '../../utils/notification.util';
import { createUserUpdateNotificationPacket } from '../../useCase/use.card/use.card.usecase';
import { autoShieldBlock } from "../../card/card.auto_shield.effect";

export const reactionUpdateUseCase = async (socket:GameSocket, reactionType:ReactionType): Promise<{success:boolean, failcode:GlobalFailCode}> =>{

    // 유효성 검증
    const userId = socket.userId;
    const roomId = socket.roomId;
    if(!userId || !roomId){
        return {  success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND  };
    }

    let room = getRoom(roomId);
    if (!room ){
        return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
    }


    // 메인 로직
    if (reactionType === ReactionType.NONE_REACTION) {
        const user = room.users.find((u) => u.id === userId);
        console.log(`유저id:${user?.id}`);
        if (user != null && user.character && user.character.stateInfo) {
            switch (user.character.stateInfo.state) {
                case CharacterStateType.BBANG_TARGET: {
                    // 피격자(user)와 공격자(shooter) 정보 확인
                    const shooterId = user.character.stateInfo.stateTargetUserId;
                    const shooter = room.users.find((u) => u.id === shooterId);
                    if (!shooter || !shooter.character) break;

                    let isDefended = false;

                    // 1. 자동 쉴드 방어 시도 (공격자가 레이저 포인터를 사용하지 않았을 때만)
                    if (user.character.equips.includes(CardType.AUTO_SHIELD) && autoShieldBlock()) {
                        isDefended = true; // 방어 성공
                        playAnimationHandler(room.users, user.id, AnimationType.SHIELD_ANIMATION);
                    }

                    // 3. 방어 최종 실패 시 데미지 적용
                    if (!isDefended) {
                        let damage = 1; // 기본 데미지
                        damage = weaponDamageEffect(damage, shooter.character);
                        user.character.hp -= damage;
                    }

                    // 4. 공통: 처리 후 상태 복구
                    if (user.character.stateInfo) {
                        user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
                        user.character.stateInfo.nextStateAt = '0';
                        user.character.stateInfo.stateTargetUserId = '0';
                    }
                    if (shooter.character.stateInfo) {
                        shooter.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
                        shooter.character.stateInfo.nextStateAt = '0';
                        shooter.character.stateInfo.stateTargetUserId = '0';
                        shooter.character.bbangCount +=1;
                    }

                    break;
                }

                case CharacterStateType.BIG_BBANG_TARGET:
                    user.character.hp -= 1;
                    user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
                    user.character.stateInfo.nextStateAt = '0';
                    user.character.stateInfo.stateTargetUserId = '0';
                    room = await CheckBigBbangService(room);
                    break;
                case CharacterStateType.GUERRILLA_TARGET:
                    user.character.hp -= 1;
                    user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
                    user.character.stateInfo.nextStateAt = '0';
                    user.character.stateInfo.stateTargetUserId = '0';
                    room = await CheckGuerrillaService(room);
                    break;
                case CharacterStateType.DEATH_MATCH_TURN_STATE:
                    // 현피 차례에서 빵야! 카드가 없을 때만 호출됨
                    await handleDeathMatchFailure(room, user);
                    break;
                case CharacterStateType.DEATH_MATCH_STATE:
                    // 현피 대기 상태에서는 아무것도 하지 않음
                    break;
            }
        }
    }
    saveRoom(room);

    const userUpdateNotificationPacket = createUserUpdateNotificationPacket(room.users);
    broadcastDataToRoom(room.users, userUpdateNotificationPacket, GamePacketType.userUpdateNotification);

    return{
        success:true, failcode:GlobalFailCode.NONE_FAILCODE
    };

};



// 현피 실패 처리 (빵야! 카드 없음)
const handleDeathMatchFailure = async (room: any, user: any) => {
    // 패배 처리
    user.character.hp -= 1;

    // 현피 종료 (양쪽 상태 초기화)
    const targetUserId = user.character.stateInfo.stateTargetUserId;
    const target = room.users.find((u: any) => u.id === targetUserId);

    if (target && target.character) {
        // 사용자 상태 초기화
        user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
        user.character.stateInfo.stateTargetUserId = '0';

        // 대상 상태 초기화
        target.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
        target.character.stateInfo.stateTargetUserId = '0';

        // Redis 업데이트
        try {
            updateCharacterFromRoom(room.id, user.id, user.character);
            updateCharacterFromRoom(room.id, target.id, target.character);
            console.log(
                `[현피] ${user.nickname} 패배! 체력: ${user.character.hp + 1} → ${user.character.hp}`,
            );
        } catch (error) {
            console.error(`[현피] Redis 업데이트 실패:`, error);
        }
    }
};

