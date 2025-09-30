import { Socket } from 'net';
import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { CardType } from '../generated/common/enums';

const bbangLogicOverflowTest = (socket: GameSocket) => {
	socket.userId = '99999999';
	socket.roomId = 999999999;

	const gamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.useCardRequest,
			useCardRequest: {
				cardType: CardType.BBANG,
				targetUserId: '88888888',
			},
		},
	};
};

export default bbangLogicOverflowTest;
