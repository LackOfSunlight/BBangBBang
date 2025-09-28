import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import roomManager from '../../managers/room.manager';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { ICard, IPeriodicEffectCard } from '../../type/card';

export class ContainmentUnitCard implements ICard, IPeriodicEffectCard {
	type: CardType = CardType.CONTAINMENT_UNIT;
	cardCategory: CardCategory = CardCategory.targetCard;

	public useCard(room: Room, user: User, target: User): boolean {
		// 유효성 검증
		if (!user.character || !user.character.stateInfo) {
			console.error('[CONTAINMENT_UNIT]사용자 정보가 존재하지 않습니다');
			return false;
		}
		if (!target.character || !target.character.stateInfo) {
			console.error('[CONTAINMENT_UNIT]타깃 유저의 정보가 존재하지 않습니다 ');
			return false;
		}

		// 이미 해당 디버프 상태일 경우 ; 중복 검증
		if (target.character.debuffs.includes(CardType.CONTAINMENT_UNIT)) {
			console.error(`[CONTAINMENT_UNIT]이미 ${target.nickname} 유저는 감금 장치에 맞았습니다. `);
			return false;
		}

		room.removeCard(user, CardType.CONTAINMENT_UNIT);
		target.character.debuffs.push(CardType.CONTAINMENT_UNIT);

		return true;
	}

	// 하루가 시작될 때 호출되는 효과
	async onNewDay(room: Room): Promise<Room> {
		return this.checkContainmentUnitTarget(room.id);
	}

	// 효과 대상자 체크
	public checkContainmentUnitTarget(roomId: number) {
		const room = roomManager.getRoom(roomId);
		if (!room || !room.users) {
			console.error(`[debuffCONTAINMENT_UNIT] 방을 찾을 수 없습니다: roomId=${roomId}`);
			return room;
		}

		// 디버프를 가진 유저들 찾기
		const usersWithDebuff = room.users.filter(
			(user) => user.character && user.character.debuffs.includes(CardType.CONTAINMENT_UNIT),
		);

		for (const user of usersWithDebuff) {
			this.debuffContainmentUnitEffect(room, user);
		}

		// 업데이트된 방 정보 반환
		return roomManager.getRoom(roomId);
	}

	// 디버프 효과 처리 로직
	public debuffContainmentUnitEffect(room: Room, user: User) {
		// 이름은 user지만 일단은 debuff targetUser의 정보
		if (!user || !user.character || !user.character.stateInfo) return;

		// 탈출 확률
		const escapeProb = 25;
		// 실제확률 25; // 테스트용 99;

		if (user.character.debuffs.includes(CardType.CONTAINMENT_UNIT)) {
			switch (user.character.stateInfo.state) {
				case CharacterStateType.NONE_CHARACTER_STATE: // 첫날은 탈출 불가
					user.character.stateInfo.state = CharacterStateType.CONTAINED;

					break;
				case CharacterStateType.CONTAINED:
					const yourProb = Math.random() * 100;

					console.log(
						`[debuffCONTAINMENT_UNIT] (${user.nickname}) : 탈출에 성공하면 디버프 상태 해제`,
					);

					if (yourProb < escapeProb && user.character.stateInfo) {
						// 탈출에 성공하면 디버프 상태 해제
						user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
						const yourDebuffIndex = user.character.debuffs.findIndex(
							(c) => c === CardType.CONTAINMENT_UNIT,
						);
						user.character.debuffs.splice(yourDebuffIndex, 1);
						console.log(
							`[debuffCONTAINMENT_UNIT]${user.nickname} 유저가 감금 상태에서 탈출에 성공했습니다`,
						);
					}
					break;
			}
		}
	}
}
