import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { CheckGuerrillaService } from '../../services/guerrilla.check.service';
import { ICard } from '../../type/card';

export class BBangCard implements ICard {
	type: CardType = CardType.BBANG;
	cardCategory: CardCategory = CardCategory.targetCard;
	static readonly BBangDamage = Number(process.env.BBangDamage);
	public useCard(room: Room, user: User, target: User): boolean {
		// 정보값 가져오기
		const nowTime = Date.now();

		if (!user || !user.character || !user.character.stateInfo) {
			console.error('[BBANG]사용자 정보가 존재하지 않습니다');
			return false;
		}
		if (!target || !target.character || !target.character.stateInfo) {
			console.error('[BBANG]타깃 유저의 정보가 존재하지 않습니다 ');
			return false;
		}

		// 타겟 유저가 사망 상태라면 불발 처리
		if (target.character.hp <= 0) {
			console.error('[BBANG]타깃 유저의 체력이 이미 0 입니다.');
			return false;
		}

		if (target.character.stateInfo.state === CharacterStateType.CONTAINED) {
			console.error('[BBANG]타킷 유저의 상태가 감옥 상태입니다.');
			return false;
		}

		if (target.character.stateInfo.state !== CharacterStateType.NONE_CHARACTER_STATE) {
			if (
				user.character.stateInfo.state === CharacterStateType.DEATH_MATCH_TURN_STATE &&
				target.character.stateInfo.state === CharacterStateType.DEATH_MATCH_STATE
			) {
				room.removeCard(user, CardType.BBANG);
				// 상태 설정
				user.character.changeState(
					CharacterStateType.DEATH_MATCH_STATE,
					CharacterStateType.DEATH_MATCH_TURN_STATE,
					Number(process.env.NEXT_TIME),
					target.id,
				);

				target.character.changeState(
					CharacterStateType.DEATH_MATCH_TURN_STATE,
					CharacterStateType.DEATH_MATCH_STATE,
					Number(process.env.NEXT_TIME),
					user.id,
				);

				return true;
			} else if (user.character.stateInfo.state === CharacterStateType.GUERRILLA_TARGET) {
				room.removeCard(user, CardType.BBANG);
				user.character.changeState();

				CheckGuerrillaService(room);

				return true;
			}

			return false;
		} else {
			room.removeCard(user, CardType.BBANG);
			// 상태 설정
			user.character.changeState(
				CharacterStateType.BBANG_SHOOTER,
				CharacterStateType.NONE_CHARACTER_STATE,
				10,
				target.id,
			);

			target.character.changeState(
				CharacterStateType.BBANG_TARGET,
				CharacterStateType.NONE_CHARACTER_STATE,
				10,
				user.id,
			);

			return true;
		}
	}
}
