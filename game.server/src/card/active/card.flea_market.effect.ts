// cardType = 10
import { CardType, CharacterStateType } from '../../generated/common/enums.js';
import { GamePacket } from '../../generated/gamePacket';
import { GamePacketType } from '../../enums/gamePacketType';
import { cardManager } from '../../managers/card.manager';
import { broadcastDataToRoom } from '../../sockets/notification';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { stateChangeService } from '../../services/state.change.service';
import { fleaMarketNotificationForm } from '../../converter/packet.form';

const cardFleaMarketEffect = (room: Room, user: User, targetUser: User): boolean => {
	const nowTime = Date.now();

	if (!room || !user) return false;

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

	if (user.character === undefined || user.character.stateInfo == undefined) return false;

	stateChangeService(
		user,
		CharacterStateType.FLEA_MARKET_TURN,
		CharacterStateType.FLEA_MARKET_WAIT,
		5,
		'0',
	);

	for (let i = 0; i < room.users.length; i++) {
		let user = room.users[i];

		if (!user.character || !user.character.stateInfo) continue;

		if (user.id === user.id || user.character.stateInfo.state === CharacterStateType.CONTAINED) {
			continue;
		}
		stateChangeService(
			user,
			CharacterStateType.FLEA_MARKET_WAIT,
			CharacterStateType.FLEA_MARKET_TURN,
			5,
			'0',
		);
	}

	return true;
};

export default cardFleaMarketEffect;
