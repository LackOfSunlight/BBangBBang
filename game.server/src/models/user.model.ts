import { UserData } from '../generated/common/types';
import { CharacterData } from '../generated/common/types';
import { CharacterPositionData } from '../generated/common/types';

export class User implements UserData {
	id: string;
	nickname: string;
	character?: CharacterData | undefined;

	constructor(id: string, nickName: string) {
		this.id = id;
		this.nickname = nickName;
	}
}
