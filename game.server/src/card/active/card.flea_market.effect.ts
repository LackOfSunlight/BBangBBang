// cardType = 10
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { CardType, CharacterStateType } from '../../generated/common/enums.js';
import { GamePacket } from '../../generated/gamePacket';
import { GamePacketType } from '../../enums/gamePacketType';
import { cardManager } from '../../managers/card.manager';
import { broadcastDataToRoom } from '../../sockets/notification';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardFleaMarketEffect = (room: Room, user: User, targetUser: User): boolean => {



	const nowTime = Date.now();
	if (!room) throw new Error(`Room ${room} not found`);
	if (!user) throw new Error(`User ${user} not found`);

	// 방에 유저들 정보 가져오기
	const users = room.users;
	if (!users || users.length === 0) throw new Error('No users in room');

	cardManager.removeCard(user, room, CardType.FLEA_MARKET);

	const prisonCount = users.reduce(
		(count, u) => count + (u.character?.stateInfo?.state === CharacterStateType.CONTAINED ? 1 : 0),
		0,
	);

	// 방 수 만큼 카드 드로우
	const selectedCards = cardManager.drawDeck(room.id, users.length - prisonCount);
	cardManager.roomFleaMarketCards.set(room.id, selectedCards);
	cardManager.fleaMarketPickIndex.set(room.id, []);
	// const pickIndex = selectedCards.map((_, index) => index);

	user.character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_TURN;
	user.character!.stateInfo!.nextState = CharacterStateType.FLEA_MARKET_WAIT;
	((user.character!.stateInfo!.nextStateAt = `${nowTime + 5}`),
		(user.character!.stateInfo!.stateTargetUserId = '0'));

	for (let i = 0; i < room.users.length; i++) {
		if (room.users[i].id === user.id || room.users[i].character?.stateInfo?.state === CharacterStateType.CONTAINED) {
			continue;
		}
		room.users[i].character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_WAIT;
		room.users[i].character!.stateInfo!.nextState = CharacterStateType.FLEA_MARKET_TURN;
		room.users[i].character!.stateInfo!.nextStateAt = `${nowTime + 5}`;
		room.users[i].character!.stateInfo!.stateTargetUserId = '0';
	}

	// 패킷으로 포장
	const gamePacket = setFleaMarketNotification(selectedCards, []);

	// 전체 방에 공지
	broadcastDataToRoom(users, gamePacket, GamePacketType.fleaMarketNotification);
	return true;
};

export default cardFleaMarketEffect;

const setFleaMarketNotification = (cardTypes: CardType[], pickIndex: number[]): GamePacket => {
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
