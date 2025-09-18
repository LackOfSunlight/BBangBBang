// import { GameSocket } from '../../type/game.socket.js';
// import { S2CAnimationNotification } from '../../generated/packet/notifications.js';
// import { GamePacket } from '../../generated/gamePacket.js';
// import { GamePacketType } from '../../enums/gamePacketType.js';
// import { broadcastDataToRoom } from '../../utils/notification.util.js';
// import { AnimationType } from '../../generated/common/enums.js';
// import { UserData } from '../../generated/common/types.js';

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