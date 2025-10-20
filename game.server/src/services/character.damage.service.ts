import { Room } from '../models/room.model';
import { User } from '../models/user.model';
import { Character, DamageContext, DamageResult } from '../models/character.model';

/**
 * CharacterDamageService
 * 
 * 새로운 OOP 방식의 Character.processDamage 메서드를 사용하는 Facade 서비스
 * 기존 takeDamageService와 동일한 인터페이스를 제공하되, 내부적으로는 
 * Character 클래스의 캡슐화된 로직을 사용합니다.
 */
export class CharacterDamageService {
	/**
	 * OOP 방식의 데미지 처리
	 * Character 클래스의 processDamage 메서드를 호출
	 */
	public static processDamage(
		room: Room,
		user: User,
		damage: number,
		shooter?: User
	): DamageResult {
		if (!user.character) {
			return { success: false, defended: false };
		}

		const context: DamageContext = {
			room,
			user,
			damage,
			shooter
		};

		return user.character.processDamage(context);
	}
}

export default CharacterDamageService;
