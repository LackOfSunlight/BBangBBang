import { UserData } from '@core/generated/common/types';
import { CharacterData } from '@core/generated/common/types';
import { Character } from './character.model';

export class User {
	id: string;
	nickname: string;
	character?: Character;

	constructor(id: string, nickName: string) {
		this.id = id;
		this.nickname = nickName;
	}

	public setUserData(id: string, nickName: string, character: CharacterData) {
		this.id = id;
		this.nickname = nickName;
		this.setCharacter(character);
	}

	public setCharacter(character: CharacterData) {
		const newCharacter: Character = new Character(
			character.characterType,
			character.roleType,
			character.hp,
			character.weapon,
			character.stateInfo!,
			character.equips,
			character.debuffs,
			character.handCards,
			character.bbangCount,
			character.handCardsCount,
		);

		this.character = newCharacter;
	}

	public toData(): UserData {
		return {
			id: this.id,
			nickname: this.nickname,
			character: this.character?.toData(),
		};
	}

	// ===== 정적 팩토리 메서드들 =====

	/**
	 * 기본 사용자 생성
	 * @param id 사용자 ID
	 * @param nickname 사용자 닉네임
	 * @returns 생성된 User 인스턴스
	 */
	public static createUser(id: string, nickname: string): User {
		return new User(id, nickname);
	}

	/**
	 * 캐릭터 포함 사용자 생성
	 * @param id 사용자 ID
	 * @param nickname 사용자 닉네임
	 * @param characterData 캐릭터 데이터
	 * @returns 생성된 User 인스턴스
	 */
	public static createUserWithCharacter(
		id: string, 
		nickname: string, 
		characterData: CharacterData
	): User {
		const user = new User(id, nickname);
		user.setCharacter(characterData);
		return user;
	}
}
