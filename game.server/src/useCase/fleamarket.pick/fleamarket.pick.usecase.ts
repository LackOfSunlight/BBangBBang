import { GamePacket } from '../../generated/gamePacket';
import { GameSocket } from '../../type/game.socket';
import { Room } from '../../models/room.model';
import { CharacterStateType, GlobalFailCode } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { getRoom, getUserFromRoom } from '../../utils/room.utils';
import { User } from '../../models/user.model';
import { broadcastDataToRoom } from '../../sockets/notification';
import { C2SFleaMarketPickRequest } from '../../generated/packet/game_actions';
import { cardManager } from '../../managers/card.manager';
import {
	fleaMarketNotificationForm,
	fleaMarketResponseForm,
	userUpdateNotificationPacketForm,
} from '../../converter/packet.form';
import roomManger from '../../managers/room.manger';
import { stateChangeService } from '../../services/state.change.service';

const fleaMarketPickUseCase = (socket: GameSocket, req: C2SFleaMarketPickRequest): GamePacket => {
	let userInfo: User;
	let room: Room;

	try {
		room = roomManger.getRoom(Number(socket.roomId));
		userInfo = roomManger.getUserFromRoom(room.id, socket.userId!);
	} catch (err) {
		console.log(`서버 에러 발생: ${err}`);
		return fleaMarketResponseForm(false, GlobalFailCode.ROOM_NOT_FOUND);
	}

	const fleaMarketCards = cardManager.roomFleaMarketCards.get(room.id);
	const pickNumbers = cardManager.fleaMarketPickIndex.get(room.id);

	if (fleaMarketCards === undefined || pickNumbers === undefined) {
		console.log('플리마켓 카드덱에서 에러 발생');
		return fleaMarketResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
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

	stateChangeService(
		userInfo,
		CharacterStateType.FLEA_MARKET_WAIT,
		CharacterStateType.NONE_CHARACTER_STATE,
		0,
		'0',
	);

	for (let i = 0; i < room.users.length; i++) {
		if (room.users[i].id === userInfo.id) {
			const nextIndex = (i + 1) % room.users.length;
			const nextUser = room.users[nextIndex];

			if (nextUser.character?.stateInfo?.nextState !== CharacterStateType.NONE_CHARACTER_STATE) {
				stateChangeService(
					nextUser,
					CharacterStateType.FLEA_MARKET_TURN,
					CharacterStateType.FLEA_MARKET_WAIT,
					5,
					'0',
				);
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

			stateChangeService(
				u,
				CharacterStateType.NONE_CHARACTER_STATE,
				CharacterStateType.NONE_CHARACTER_STATE,
				0,
				'0',
			);
		}

		cardManager.fleaMarketPickIndex.set(room.id, []);
		cardManager.roomFleaMarketCards.set(room.id, []);
	}

	const fleaMarketGamePacket = fleaMarketNotificationForm(fleaMarketCards, pickNumbers);
	const userUpdateGamePacket = userUpdateNotificationPacketForm(room.users);

	broadcastDataToRoom(room.users, fleaMarketGamePacket, GamePacketType.fleaMarketNotification);

	broadcastDataToRoom(room.users, userUpdateGamePacket, GamePacketType.userUpdateNotification);

	return fleaMarketResponseForm(true, GlobalFailCode.NONE_FAILCODE);
};

export default fleaMarketPickUseCase;
