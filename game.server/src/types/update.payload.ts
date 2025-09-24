import { CharacterData, UserData } from '../generated/common/types';
import { GamePacket } from '../generated/gamePacket';

/**
 * 카드 효과 실행 결과를 담는 표준화된 페이로드입니다.
 * 이펙트 함수는 상태를 직접 변경하지 않고, 이 페이로드를 반환하여
 * 공통 파이프라인에서 안전하게 상태를 적용할 수 있도록 합니다.
 */
export interface UpdatePayload {
  /** 카드를 사용한 유저 ID */
  userId: string;
  
  /** 상호작용 카드의 경우 타겟 유저 ID (단독 카드는 undefined) */
  targetUserId?: string;
  
  /** 유저 캐릭터 데이터 변경사항 */
  characterUpdates: Partial<CharacterData>;
  
  /** 타겟 유저 캐릭터 데이터 변경사항 (상호작용 카드만) */
  targetCharacterUpdates?: Partial<CharacterData>;
  
  /** 방 데이터 변경사항 (덱, 페이즈 등) */
  roomUpdates?: {
    deck?: CardData[];
    phaseType?: number;
    nextPhaseAt?: string;
  };
  
  /** 전송할 알림 패킷 목록 */
  notificationGamePackets: GamePacket[];
}


/**
 * 카드 데이터 타입 (덱 관리용)
 */
interface CardData {
  type: number;
  count: number;
}
