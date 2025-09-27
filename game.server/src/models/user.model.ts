import { UserData } from '../generated/common/types';
import { CharacterData } from '../generated/common/types';
import { Character } from './character.model';

export class User implements UserData {
	id: string;
	nickname: string;
	character?: Character | undefined;

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
}
