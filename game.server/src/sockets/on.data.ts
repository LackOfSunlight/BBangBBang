import { Socket } from 'net';
import { handleError } from '../handlers/handleError.js';
import { GamePacket } from '../generated/gamePacket.js';
import { gamePacketDispatcher } from '../dispatcher/game.packet.dispatcher.js';

interface Packet {
	payloadType: number;
	version: string;
	sequence: number;
	payload: Buffer;
}

// Socket 인터페이스 확장으로 타입 안전성 확보
interface ExtendedSocket extends Socket {
	buffer?: Buffer;
}

// 소켓별 버퍼를 관리하는 간단한 변수 (소켓 객체에 직접 저장)

export const onData = (socket: Socket, chunk: Buffer) => {
	try {
		// ExtendedSocket으로 타입 캐스팅하여 타입 안전성 확보
		const extendedSocket = socket as ExtendedSocket;
		
		// 기존 버퍼 가져오기 또는 새로 생성 (소켓 객체에 직접 저장)
		let buffer = extendedSocket.buffer || Buffer.alloc(0);

		// 새 청크와 기존 버퍼 합치기
		buffer = Buffer.concat([buffer, chunk]);

		// 버퍼 업데이트 (소켓 객체에 직접 저장)
		extendedSocket.buffer = buffer;

		while (buffer.length >= 11) {
			// 최소 헤더 크기: type(2) + verLen(1) + seq(4) + payloadLen(4)
			const payloadType = buffer.readUint16BE(0);
			const versionLength = buffer.readUint8(2);
			const headerLen = 2 + 1 + versionLength + 4 + 4;

			if (buffer.length < headerLen) break;

			const version = buffer.toString('utf8', 3, 3 + versionLength);
			const sequence = buffer.readUint32BE(3 + versionLength);
			const payloadLength = buffer.readUint32BE(3 + versionLength + 4);

			if (buffer.length < headerLen + payloadLength) break;

			const payloadStart = headerLen;
			const payloadEnd = headerLen + payloadLength;
			const payloadBuf = buffer.subarray(payloadStart, payloadEnd);

			const packet: Packet = {
				payloadType: payloadType,
				version: version,
				sequence: sequence,
				payload: payloadBuf,
			};

			console.log(`패킷 수신: type=${packet.payloadType}, seq=${packet.sequence}`);

			const gamePacket = GamePacket.fromBinary(payloadBuf);
			// handleGamePacket(socket, gamePacket);
			gamePacketDispatcher(socket, gamePacket);

			buffer = buffer.subarray(payloadEnd);
			extendedSocket.buffer = buffer;
		}
	} catch (error) {
		handleError(socket, error);
	}
};

// 소켓 연결 종료 시 버퍼 정리
export const cleanupSocketBuffer = (socket: Socket) => {
	const extendedSocket = socket as ExtendedSocket;
	delete extendedSocket.buffer;
};
