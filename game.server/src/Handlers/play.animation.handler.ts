import { GamePacket } from '../Generated/gamePacket';
import { GamePacketType } from '../Enums/gamePacketType';
import { broadcastDataToRoom } from '../Sockets/notification';
import { AnimationType } from '../Generated/common/enums';
import { UserData } from '../Generated/common/types';
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
