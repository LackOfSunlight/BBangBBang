// import { GameSocket } from '../../type/game.socket';
// import { GamePacket } from '../../generated/gamePacket';
// import { GamePacketType } from '../../enums/gamePacketType';
// import { PhaseType, RoomStateType } from '../../generated/common/enums';
// import { broadcastDataToRoom } from '../../utils/notification.util';
// import { getRoom } from '../../utils/room.utils';
// import { Room } from '../../models/room.model';

// const phaseUpdateNotificationHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
// 	if (!socket.roomId) return;

// 	const room: Room | null = await getRoom(socket.roomId);
// 	if (!room) return;

// 	// 게임 중인 방에서만 페이즈 업데이트 가능
// 	if (room.state !== RoomStateType.INGAME) return;

// 	// 페이즈 타입 검증 (유효한 PhaseType인지)
// 	if (gamePacket.payload.oneofKind === 'phaseUpdateNotification') {
// 		const phaseType = gamePacket.payload.phaseUpdateNotification.phaseType;
// 		if (!Object.values(PhaseType).includes(phaseType)) return;
// 	}

// 	broadcastDataToRoom(room.users, gamePacket, GamePacketType.phaseUpdateNotification);
// };


// export default phaseUpdateNotificationHandler;
