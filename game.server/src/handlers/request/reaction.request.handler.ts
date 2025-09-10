import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { CharacterStateType, GlobalFailCode, ReactionType } from '../../generated/common/enums.js';
import reactionResponseHandler from '../response/reaction.response.handler.js';
import { getRoom, saveRoom } from '../../utils/redis.util.js';
import userUpdateNotificationHandler from '../notification/user.update.notification.handler.js';
import { setUserUpdateNotification } from './use.card.request.handler.js';
import { getSocketByUserId } from '../../managers/socket.manger.js';
import { CheckBigBbangService } from '../../services/bigbbang.check.service.js';
import { CheckGuerrillaService } from '../../services/guerrilla.check.service.js';

const reactionRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.reactionRequest);

	if (!payload || !socket.userId || !socket.roomId) {
		return reactionResponseHandler(
			socket,
			setReactionResponse(false, GlobalFailCode.INVALID_REQUEST),
		);
	}

	const req = payload.reactionRequest;

	let room = await getRoom(socket.roomId);

	if (!room) {
		return reactionRequestHandler(
			socket,
			setReactionResponse(false, GlobalFailCode.ROOM_NOT_FOUND),
		);
	}

	if (req.reactionType === ReactionType.NONE_REACTION) {
		const user = room.users.find((u) => u.id === socket.userId);
        console.log(`유저id:${user?.id}`);
		if (user != null) {
			switch (user.character?.stateInfo?.state) {
				case CharacterStateType.BBANG_TARGET:
                    user.character.hp -=1;
					break;
				case CharacterStateType.BIG_BBANG_TARGET:
					user.character.hp -= 1;
                    user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
                    user.character.stateInfo.nextStateAt = '0';
                    user.character.stateInfo.stateTargetUserId = '0';
					room = await CheckBigBbangService(room);
				case CharacterStateType.DEATH_MATCH_TURN_STATE:
					break;
				case CharacterStateType.GUERRILLA_TARGET:
					user.character.hp -= 1;
                    user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
                    user.character.stateInfo.nextStateAt = '0';
                    user.character.stateInfo.stateTargetUserId = '0';
					room = await CheckGuerrillaService(room);
					break;        
			}
		}
	} 
	await saveRoom(room);

	reactionResponseHandler(socket, setReactionResponse(true, GlobalFailCode.NONE_FAILCODE));
	await userUpdateNotificationHandler(socket, setUserUpdateNotification(room.users));
};

const setReactionResponse = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.reactionResponse,
			reactionResponse: {
				success,
				failCode,
			},
		},
	};
	return newGamePacket;
};

export default reactionRequestHandler;
