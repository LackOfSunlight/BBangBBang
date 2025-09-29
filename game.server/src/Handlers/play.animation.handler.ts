import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../Enums/gamePacketType';
import { broadcastDataToRoom } from '../Sockets/notification';
import { AnimationType } from '../generated/common/enums';
import { UserData } from '../generated/common/types';
import { User } from '../Models/user.model';

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
