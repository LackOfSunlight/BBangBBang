import { CardType } from '../../generated/common/enums';
import { UserData, RoomData } from '../../generated/common/types';
import { SoloEffectHandler } from '../../types/effect.handler';
import { Result, ok, err } from '../../types/result';
import { UpdatePayload } from '../../types/update.payload';
import { createUserUpdateNotificationGamePacket, createUseCardNotificationGamePacket } from '../../utils/notification.builder';

/**
 * 백신 카드 이펙트입니다.
 * 사용자의 체력을 1 회복시키는 단독 카드입니다.
 * 
 * 이펙트는 순수 함수로 구현되어 있어:
 * - 입력된 데이터를 읽기만 하고 변경하지 않음
 * - 계산 결과만 UpdatePayload로 반환
 * - 실제 상태 변경은 파이프라인(CardUseService)에서 처리
 */
export const vaccineEffectHandler: SoloEffectHandler = (
  user: UserData,
  room: RoomData
): Result<UpdatePayload> => {
  // 가드 리턴: 캐릭터 정보 없음
  if (!user.character) {
    return err('CHARACTER_NOT_FOUND');
  }

  // 가드 리턴: 체력이 이미 최대치
  const maxHp = getMaxHp(user.character.characterType);
  if (user.character.hp >= maxHp) {
    return err('HP_ALREADY_MAX');
  }

  // 체력 회복 계산 (최대 체력 초과 방지)
  const newHp = Math.min(user.character.hp + 1, maxHp);

  // 업데이트 페이로드 생성
  const payload: UpdatePayload = {
    userId: user.id,
    characterUpdates: {
      hp: newHp
    },
          notificationGamePackets: [
            createUseCardNotificationGamePacket(CardType.VACCINE, user.id, '0'),
            createUserUpdateNotificationGamePacket(room.users)
          ]
  };

  return ok(payload);
};

/**
 * 캐릭터 타입별 최대 체력을 반환합니다.
 * TODO: 실제 캐릭터 유틸리티에서 가져오도록 수정
 */
function getMaxHp(characterType: number): number {
  // 임시 구현
  return 3;
}
