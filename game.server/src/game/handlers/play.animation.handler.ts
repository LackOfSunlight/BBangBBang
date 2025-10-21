import { GamePacket } from '@core/generated/gamePacket';
import { GamePacketType } from '@game/enums/gamePacketType';
import { broadcastDataToRoom } from '@core/network/sockets/notification';
import { AnimationType } from '@core/generated/common/enums';
import { UserData } from '@core/generated/common/types';
import { User } from '@game/models/user.model';

export const playAnimationHandler = (
	users: UserData[],
	userId: string,
	animationType: AnimationType,
) => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.animationNotification,
			animationNotification: {
				userId: userId,
				animationType: animationType,
			},
		},
	};

	broadcastDataToRoom(users, newGamePacket, GamePacketType.animationNotification);
};
