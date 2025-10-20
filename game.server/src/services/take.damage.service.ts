import { Room } from '../models/room.model';
import { User } from '../models/user.model';
import { CharacterDamageService } from './character.damage.service';

/**
 * takeDamageService - 새로운 OOP 방식으로 완전 전환
 * 
 * 기존 레거시 로직을 제거하고 CharacterDamageService를 사용합니다.
 * Character 클래스의 캡슐화된 로직을 통해 데미지 처리를 수행합니다.
 */
const takeDamageService = (room: Room, user: User, damage: number, shooter?: User) => {
	return CharacterDamageService.processDamage(room, user, damage, shooter);
};

export default takeDamageService;