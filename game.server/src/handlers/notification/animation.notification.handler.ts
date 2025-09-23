// import { GameSocket } from '../../type/game.socket';
// import { GamePacket } from '../../generated/gamePacket';
// import { GamePacketType } from '../../enums/gamePacketType';
// import { broadcastDataToRoom } from '../../utils/notification.util';
// import { AnimationType } from '../../generated/common/enums';
// import { UserData } from '../../generated/common/types';

// export const sendAnimationNotification = (
// 	users: UserData[],
// 	userId: string,
// 	animationType: AnimationType,
// ) => {
// 	const newGamePacket: GamePacket = {
// 		payload: {
// 			oneofKind: GamePacketType.animationNotification,
// 			animationNotification: {
// 				userId: userId,
// 				animationType: animationType,
// 			},
// 		},
// 	};

// 	broadcastDataToRoom(users, newGamePacket, GamePacketType.animationNotification);
// };

// const animationNotificationHandler = (socket: GameSocket, gamePacket: GamePacket) => {};

// export default animationNotificationHandler;
