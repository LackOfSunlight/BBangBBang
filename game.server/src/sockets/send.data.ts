import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../Enums/gamePacketType';
import { Socket } from 'net';

const version = '1.0.0';
let sequence = 1;

export const sendData = (
	socket: Socket,
	gamePacket: GamePacket,
	gamePacketType: GamePacketType,
) => {
	const payloadBuffer = Buffer.from(GamePacket.toBinary(gamePacket));

	const type: number = getTypeNumber(gamePacketType);

	const typeBuffer = Buffer.alloc(2);
	typeBuffer.writeInt16BE(type);

	const versionBytes = Buffer.from(version, 'utf-8');
	const versionLengthBuffer = Buffer.alloc(1);
	versionLengthBuffer.writeUInt8(versionBytes.length);

	const sequenceBuffer = Buffer.alloc(4);
	sequenceBuffer.writeInt32BE(sequence);
	sequence++;

	const payloadLengthBuffer = Buffer.alloc(4);
	payloadLengthBuffer.writeInt32BE(payloadBuffer.length);

	const packetBuffer = Buffer.concat([
		typeBuffer,
		versionLengthBuffer,
		versionBytes,
		sequenceBuffer,
		payloadLengthBuffer,
		payloadBuffer,
	]);

	socket.write(packetBuffer);

	console.log(`패킷 전송 type:${type}, seq:${sequence}, length: ${packetBuffer.length}`);
};

const getTypeNumber = (gamePacketType: GamePacketType) => {
	switch (gamePacketType) {
		case GamePacketType.registerRequest:
			return 1;
		case GamePacketType.registerResponse:
			return 2;
		case GamePacketType.loginRequest:
			return 3;
		case GamePacketType.loginResponse:
			return 4;
		case GamePacketType.createRoomRequest:
			return 5;
		case GamePacketType.createRoomResponse:
			return 6;
		case GamePacketType.getRoomListRequest:
			return 7;
		case GamePacketType.getRoomListResponse:
			return 8;
		case GamePacketType.joinRoomRequest:
			return 9;
		case GamePacketType.joinRoomResponse:
			return 10;
		case GamePacketType.joinRandomRoomRequest:
			return 11;
		case GamePacketType.joinRandomRoomResponse:
			return 12;
		case GamePacketType.joinRoomNotification:
			return 13;
		case GamePacketType.leaveRoomRequest:
			return 14;
		case GamePacketType.leaveRoomResponse:
			return 15;
		case GamePacketType.leaveRoomNotification:
			return 16;
		case GamePacketType.gamePrepareRequest:
			return 17;
		case GamePacketType.gamePrepareResponse:
			return 18;
		case GamePacketType.gamePrepareNotification:
			return 19;
		case GamePacketType.gameStartRequest:
			return 20;
		case GamePacketType.gameStartResponse:
			return 21;
		case GamePacketType.gameStartNotification:
			return 22;
		case GamePacketType.positionUpdateRequest:
			return 23;
		case GamePacketType.positionUpdateNotification:
			return 24;
		case GamePacketType.useCardRequest:
			return 25;
		case GamePacketType.useCardResponse:
			return 26;
		case GamePacketType.useCardNotification:
			return 27;
		case GamePacketType.equipCardNotification:
			return 28;
		case GamePacketType.cardEffectNotification:
			return 29;
		case GamePacketType.fleaMarketNotification:
			return 30;
		case GamePacketType.fleaMarketPickRequest:
			return 31;
		case GamePacketType.fleaMarketPickResponse:
			return 32;
		case GamePacketType.userUpdateNotification:
			return 33;
		case GamePacketType.phaseUpdateNotification:
			return 34;
		case GamePacketType.reactionRequest:
			return 35;
		case GamePacketType.reactionResponse:
			return 36;
		case GamePacketType.destroyCardRequest:
			return 37;
		case GamePacketType.destroyCardResponse:
			return 38;
		case GamePacketType.gameEndNotification:
			return 39;
		case GamePacketType.cardSelectRequest:
			return 40;
		case GamePacketType.cardSelectResponse:
			return 41;
		case GamePacketType.passDebuffRequest:
			return 42;
		case GamePacketType.passDebuffResponse:
			return 43;
		case GamePacketType.warningNotification:
			return 44;
		case GamePacketType.animationNotification:
			return 45;
		default:
			return 0;
	}
};
