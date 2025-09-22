import { GamePacket } from '../../generated/gamePacket';
import { GameSocket } from '../../type/game.socket';
import { Room } from '../../models/room.model';
import { CardType, CharacterStateType, GlobalFailCode } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { addUserToRoom, getRoom, getRooms, getUserFromRoom } from '../../utils/room.utils';
import { User } from '../../models/user.model';
import { broadcastDataToRoom } from '../../utils/notification.util';
import { C2SFleaMarketPickRequest } from '../../generated/packet/game_actions';
import { fleaMarketPickIndex, roomFleaMarketCards } from '../../managers/card.manager';
import { count } from 'console';

const fleaMarketPickUseCase = (socket: GameSocket, req: C2SFleaMarketPickRequest): GamePacket => {
	let userInfo: User;
	let room: Room;

	try {
		room = getRoom(Number(socket.roomId));
		userInfo = getUserFromRoom(room.id, socket.userId!);
	} catch (err) {
		console.log(`DB 에러 발생: ${err}`);
		return formFleaMarketResponse(false, GlobalFailCode.ROOM_NOT_FOUND);
	}

	const fleaMarketCards = roomFleaMarketCards.get(room.id);
	const pickNumbers = fleaMarketPickIndex.get(room.id);

	if (fleaMarketCards === undefined || pickNumbers === undefined) {
		console.log('플리마켓 카드덱에서 에러 발생');
		return formFleaMarketResponse(false, GlobalFailCode.UNKNOWN_ERROR);
	}

	const selectedCard = fleaMarketCards[req.pickIndex];
	pickNumbers.push(req.pickIndex);

	const existCard = userInfo.character!.handCards.find((c) => c.type === selectedCard);

	if (existCard) {
		existCard.count += 1;
	} else {
		userInfo.character!.handCards.push({ type: selectedCard, count: 1 });
	}

	userInfo.character!.handCardsCount += 1;

	userInfo.character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_WAIT;
	userInfo.character!.stateInfo!.nextState = CharacterStateType.NONE_CHARACTER_STATE;
	userInfo.character!.stateInfo!.nextStateAt = '0';

	for (let i = 0; i < room.users.length; i++) {
		if (room.users[i].id === userInfo.id) {
			const nextIndex = (i + 1) % room.users.length;
			const nextUser = room.users[nextIndex];

			if (nextUser.character?.stateInfo?.nextState !== CharacterStateType.NONE_CHARACTER_STATE) {
				nextUser.character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_TURN;
				nextUser.character!.stateInfo!.nextState = CharacterStateType.FLEA_MARKET_WAIT;
				nextUser.character!.stateInfo!.nextStateAt = '5';
				break;
			}
		}
	}

	// 모든 유저가 FLEA_MARKET_WAIT 상태인지 확인
	const allWaiting = room.users
		.filter((u) => u.character?.stateInfo?.state !== CharacterStateType.CONTAINED)
		.every((u) => u.character?.stateInfo?.state === CharacterStateType.FLEA_MARKET_WAIT);

	if (allWaiting) {
		for (const u of room.users) {
			// 감옥에 있는 애들은 상태를 바꾸지 않음
			if (u.character?.stateInfo?.state === CharacterStateType.CONTAINED) continue;

			u.character!.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;
			u.character!.stateInfo!.nextState = CharacterStateType.NONE_CHARACTER_STATE;
			u.character!.stateInfo!.nextStateAt = '0';
		}

		fleaMarketPickIndex.set(room.id, []);
		roomFleaMarketCards.set(room.id, []);
	}

	const fleaMarketGamePacket = formFleaMarketNotification(fleaMarketCards, pickNumbers);
	const userUpdateGamePacket = fromUserUpdateNotificationPacket(room.users);

	broadcastDataToRoom(room.users, fleaMarketGamePacket, GamePacketType.fleaMarketNotification);

	broadcastDataToRoom(room.users, userUpdateGamePacket, GamePacketType.userUpdateNotification);

	return formFleaMarketResponse(true, GlobalFailCode.NONE_FAILCODE);
};

const formFleaMarketResponse = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.fleaMarketPickResponse,
			fleaMarketPickResponse: {
				success,
				failCode,
			},
		},
	};

	return newGamePacket;
};

const formFleaMarketNotification = (cardTypes: CardType[], pickIndex: number[]): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.fleaMarketNotification,
			fleaMarketNotification: {
				cardTypes,
				pickIndex,
			},
		},
	};

	return newGamePacket;
};

const fromUserUpdateNotificationPacket = (user: User[]): GamePacket => {
	const NotificationPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.userUpdateNotification,
			userUpdateNotification: {
				user: user,
			},
		},
	};

	return NotificationPacket;
};

export default fleaMarketPickUseCase;
