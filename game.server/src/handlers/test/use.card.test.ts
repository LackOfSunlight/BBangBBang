import {
	useCardUseCase,
	createUseCardNotificationPacket,
	createUserUpdateNotificationPacket,
} from '../../UseCase/Use.card/use.card.usecase';
import useCardHandler, { createUseCardResponsePacket } from '../use.card.handler';

import { CardType, GlobalFailCode } from '../../Generated/common/enums';
import { GamePacketType } from '../../Enums/gamePacketType';

import { getRoom } from '../../Utils/room.utils';
import { applyCardEffect } from '../../Dispatcher/apply.card.dispacher';
import { sendData } from '../../Sockets/send.data';
import { broadcastDataToRoom } from '../../Sockets/notification';

jest.mock('../../utils/room.utils', () => ({
	getRoom: jest.fn(),
}));
jest.mock('../../utils/send.data', () => ({
	sendData: jest.fn(),
}));
jest.mock('../../utils/notification.util', () => ({
	broadcastDataToRoom: jest.fn(),
}));
jest.mock('../../utils/apply.card.effect', () => ({
	applyCardEffect: jest.fn(),
}));

const mockedGetRoom = getRoom as jest.Mock;
const mockedSendData = sendData as jest.Mock;
const mockedBroadcast = broadcastDataToRoom as jest.Mock;
const mockedApplyCardEffect = applyCardEffect as jest.Mock;

describe('useCardHandler', () => {
	const socket: any = { userId: 'user1', roomId: 123 };
	const roomMock = { users: [{ id: 'user1' }, { id: 'user2' }] };

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('잘못된 userId/roomId에 대한 검증 시 INVALID_REQUEST 반환 ', async () => {
		const badSocket: any = {};
		await useCardHandler(badSocket, {} as any);
		expect(mockedSendData).toHaveBeenCalled();
		const [, packet, type] = mockedSendData.mock.calls[0];
		expect(type).toBe(GamePacketType.useCardResponse);
		expect(packet.payload.useCardResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
	});

	it('올바른 카드 요청을 받으면 notification 송신', async () => {
		mockedGetRoom.mockReturnValue(roomMock);
		mockedApplyCardEffect.mockResolvedValue(true);

		const fakePacket: any = {
			payload: {
				oneofKind: GamePacketType.useCardRequest,
				useCardRequest: { cardType: CardType.BBANG, targetUserId: 'user2' },
			},
		};

		// 데이터 페이로드를 반환하는 getGamePacketType를 mock
		jest.spyOn(require('../../utils/type.converter'), 'getGamePacketType').mockReturnValue({
			useCardRequest: fakePacket.payload.useCardRequest,
		});

		await useCardHandler(socket, fakePacket);

		expect(mockedSendData).toHaveBeenCalled();
		expect(mockedBroadcast).toHaveBeenCalled();
	});
});

describe('useCardUseCase', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('방을 찾지 못하면 실패 처리', async () => {
		mockedGetRoom.mockImplementation(() => {
			throw new Error('Room not found');
		});

		const result = await useCardUseCase('user1', 123, CardType.BBANG, 'user2');

		expect(result.success).toBe(false);
		expect(result.failcode).toBe(GlobalFailCode.ROOM_NOT_FOUND);
	});

	it('cardType이 없다면 실패 처리', async () => {
		mockedGetRoom.mockReturnValue({ users: [] });

		const result = await useCardUseCase('user1', 123, CardType.NONE, 'user2');

		expect(result.success).toBe(false);
		expect(result.failcode).toBe(GlobalFailCode.INVALID_REQUEST);
	});

	it('성공시 applyCardEffect 함수로 연결', async () => {
		mockedGetRoom.mockReturnValue({ users: [{ id: 'user1' }] });
		mockedApplyCardEffect.mockResolvedValue(true);

		const result = await useCardUseCase('user1', 123, CardType.BBANG, 'user2');

		expect(mockedApplyCardEffect).toHaveBeenCalledWith(123, CardType.BBANG, 'user1', 'user2');
		expect(result.success).toBe(true);
		expect(result.failcode).toBe(GlobalFailCode.NONE_FAILCODE);
	});
});

describe('Packet creators', () => {
	it('response 패킷 검증', () => {
		const packet = createUseCardResponsePacket(true, GlobalFailCode.NONE_FAILCODE);
		// 타입 단언을 통해 TS
		const response = (packet.payload as any).useCardResponse;
		expect(response.success).toBe(true);
	});

	it('notification 패킷 검증', () => {
		const packet = createUseCardNotificationPacket(CardType.BBANG, 'u1', 'u2');
		const notification = (packet.payload as any).useCardNotification;
		expect(notification.cardType).toBe(CardType.BBANG);
		expect(notification.userId).toBe('u1');
	});

	it('user update notification 패킷 검증', () => {
		const packet = createUserUpdateNotificationPacket([{ id: 'u1' }] as any);
		const notification2 = (packet.payload as any).userUpdateNotification;
		expect(notification2.user[0].id).toBe('u1');
	});
});
