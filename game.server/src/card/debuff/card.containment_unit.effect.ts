// cardType = 21
import { getUserFromRoom, updateCharacterFromRoom, getRoom } from '../../utils/room.utils';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { removeCard } from '../../managers/card.manager';

// 디버프 적용 처리 로직
const cardContainmentUnitEffect = (
	roomId: number,
	userId: string,
	targetUserId: string,
): boolean => {
	const user = getUserFromRoom(roomId, userId);
	const target = getUserFromRoom(roomId, targetUserId);
	const room = getRoom(roomId);
	// 유효성 검증
	if (!user || !user.character || !user.character.stateInfo) {
		console.error('[CONTAINMENT_UNIT]사용자 정보가 존재하지 않습니다');
		return false;
	}
	if (!target || !target.character || !target.character.stateInfo) {
		console.error('[CONTAINMENT_UNIT]타깃 유저의 정보가 존재하지 않습니다 ');
		return false;
	}
	if (!room) {
		console.error('[CONTAINMENT_UNIT]방이 존재하지 않습니다.');
		return false;
	}

	// 이미 해당 디버프 상태일 경우 ; 중복 검증
	if (target.character.debuffs.includes(CardType.CONTAINMENT_UNIT)) {
		console.error(`[CONTAINMENT_UNIT]이미 ${target.nickname} 유저는 감금 장치에 맞았습니다. `);
		return false;
	}

	// 카드 제거
	removeCard(user, room, CardType.CONTAINMENT_UNIT);

	target.character.debuffs.push(CardType.CONTAINMENT_UNIT);
	//console.log(`유저 ${targetUserId}가 감금장치 카드에 맞았습니다.\n다음 차례부터 감금장치에 영향을 받습니다.`);

	// 수정 정보 갱신
	try {
		updateCharacterFromRoom(roomId, targetUserId, target.character);
		//console.log('[CONTAINMENT_UNIT]로그 저장에 성공하였습니다');
		return true;
	} catch (error) {
		console.error(`[CONTAINMENT_UNIT]로그 저장에 실패하였습니다:[${error}]`);
		return false;
	}
};

// 효과 대상자 체크
export const checkContainmentUnitTarget = (roomId: number) => {
	const room = getRoom(roomId);
	if (!room || !room.users) {
		console.error(`[debuffCONTAINMENT_UNIT] 방을 찾을 수 없습니다: roomId=${roomId}`);
		return room;
	}

	// 디버프를 가진 유저들 찾기
	const usersWithDebuff = room.users.filter(
		(user) => user.character && user.character.debuffs.includes(CardType.CONTAINMENT_UNIT),
	);

	// console.log(`[debuffCONTAINMENT_UNIT] 디버프를 가진 유저 수: ${usersWithDebuff.length}`);

	for (const user of usersWithDebuff) {
		debuffContainmentUnitEffect(roomId, user.id);
	}

	// 업데이트된 방 정보 반환
	return getRoom(roomId);
};

// 디버프 효과 처리 로직
export const debuffContainmentUnitEffect = (roomId: number, userId: string) => {
	// 이름은 user지만 일단은 debuff targetUser의 정보
	const user = getUserFromRoom(roomId, userId);
	if (!user || !user.character) return;

	//console.log(`[debuffCONTAINMENT_UNIT] (${user.nickname}) : 유저정보식별 성공`);

	// 탈출 확률
	const escapeProb = 25; 
	// 실제확률 25; // 테스트용 99; 

	if (user.character.debuffs.includes(CardType.CONTAINMENT_UNIT)) {
		//console.log(`[debuffCONTAINMENT_UNIT] (${user.nickname}) : 디버프 카드 등록 상태 인지 성공`);

		switch (user.character.stateInfo!.state) {
			case CharacterStateType.NONE_CHARACTER_STATE: // 첫날은 탈출 불가
				// console.log(
				// 	`[debuffCONTAINMENT_UNIT] (${user.nickname}) : 현재 상태 : ${CharacterStateType[user.character.stateInfo!.state]}`,
				// );

				user.character.stateInfo!.state = CharacterStateType.CONTAINED;
				//user.character.stateInfo!.nextState = CharacterStateType.CONTAINED;

				// console.log(
				// 	`[debuffCONTAINMENT_UNIT] (${user.nickname}) : 디버프 감염 완료 : ${CharacterStateType[user.character.stateInfo!.state]}`,
				// );

				try {
					updateCharacterFromRoom(roomId, userId, user.character);
					//console.log(`[debuffCONTAINMENT_UNIT] (${user.nickname}) :  로그 저장에 성공하였습니다`);
				} catch (error) {
					console.error(`[debuffCONTAINMENT_UNIT]로그 저장에 실패하였습니다:[${error}]`);
				}

				break;
			case CharacterStateType.CONTAINED:
				const yourProb = Math.random() * 100;

				console.log(
					`[debuffCONTAINMENT_UNIT] (${user.nickname}) : 탈출에 성공하면 디버프 상태 해제`,
				);

				if (yourProb < escapeProb) {
					// 탈출에 성공하면 디버프 상태 해제
					user.character.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;
					//user.character.stateInfo!.nextState = CharacterStateType.NONE_CHARACTER_STATE;
					const yourDebuffIndex = user.character.debuffs.findIndex(
						(c) => c === CardType.CONTAINMENT_UNIT,
					);
					user.character.debuffs.splice(yourDebuffIndex, 1);
					console.log(`[debuffCONTAINMENT_UNIT]${user.nickname} 유저가 감금 상태에서 탈출에 성공했습니다`);

					try {
						updateCharacterFromRoom(roomId, userId, user.character);
						//console.log(`[debuffCONTAINMENT_UNIT] (${user.nickname}) :  로그 저장에 성공하였습니다`);
					} catch (error) {
						console.error(`[debuffCONTAINMENT_UNIT]로그 저장에 실패하였습니다:[${error}]`);
					}
				}
				break;
			default:
				break;
		}

		// console.log(
		// 	`[debuffCONTAINMENT_UNIT] (${user.nickname}) : 로직 종료 : ${CharacterStateType[user.character.stateInfo!.state]}`,
		// );
	}

	return user;
};
export default cardContainmentUnitEffect;
