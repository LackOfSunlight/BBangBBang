import { GameSocket } from '../../type/game.socket.js';
import { S2CGameStartNotification } from '../../generated/packet/notifications.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { CharacterPositionData, GameStateData } from '../../generated/common/types.js';
import { User } from '../../models/user.model.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { send } from 'process';
import { sendData } from '../../utils/send.data.js';

const gameStartNotificationHandler = (socket: GameSocket, gamePacket: GamePacket) => {
	sendData(socket, gamePacket, GamePacketType.gameStartNotification);
};

export const setGameStartNotification = (
	gameState: GameStateData,
	users: User[],
	characterPositions: CharacterPositionData[],
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.gameStartNotification,
			gameStartNotification: {
				gameState,
				users,
				characterPositions,
			},
		},
	};

	return newGamePacket;
};

export default gameStartNotificationHandler;
