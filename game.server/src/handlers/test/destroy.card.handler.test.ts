import destroyCardHandler from '../destroy.card.handler';
import { GameSocket } from '../../Type/game.socket.js';
import { GamePacket } from '../../Generated/gamePacket.js';
import { getGamePacketType } from '../../Converter/type.form.js';
import { sendData } from '../../Sockets/send.data.js';
import destroyCardUseCase from '../../UseCase/Destroy.card/destroy.card.usecase';
import { GamePacketType } from '../../Enums/gamePacketType.js';
import { CardType, CharacterType, RoleType } from '../../Generated/common/enums';
import { User } from '../../Models/user.model';
import { CardData, CharacterData } from '../../Generated/common/types';
import { C2SDestroyCardRequest } from '../../Generated/packet/game_actions';

jest.mock('../../utils/type.converter.js');
jest.mock('../../useCase/destroy.card/destroy.card.usecase');
jest.mock('../../utils/send.data.js');

describe('destroyCardRequestHandler', () => {
	let mockSocket: Partial<GameSocket>;
	let mockGamePacket: GamePacket;
	let mockCardData: CardData[];
	let mockReturnGamePacket: GamePacket;
	let mockPayLoad: C2SDestroyCardRequest;

	beforeEach(() => {
		mockSocket = {
			userId: '1',
			roomId: 1,
		};

		mockCardData = [{ type: CardType.BBANG, count: 1 }];

		mockGamePacket = {
			payload: {
				oneofKind: GamePacketType.destroyCardRequest,
				destroyCardRequest: {
					destroyCards: [{ type: CardType.BBANG, count: 1 }],
				},
			},
		};

		mockReturnGamePacket = {
			payload: {
				oneofKind: GamePacketType.destroyCardResponse,
				destroyCardResponse: {
					handCards: mockCardData,
				},
			},
		};

		mockPayLoad = {
			destroyCards: [{ type: CardType.BBANG, count: 1 }],
		};

		(getGamePacketType as jest.Mock).mockReturnValue(mockGamePacket.payload);
		(destroyCardUseCase as jest.Mock).mockResolvedValue(mockReturnGamePacket);
		(sendData as jest.Mock).mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('요청을 성공적으로 처리하고 응답을 전송해야 함', async () => {
		await destroyCardHandler(mockSocket as GameSocket, mockGamePacket);

		expect(getGamePacketType).toHaveBeenCalledWith(
			mockGamePacket,
			GamePacketType.destroyCardRequest,
		);
		expect(destroyCardUseCase).toHaveBeenCalledWith(mockSocket, mockPayLoad);

		expect(sendData).toHaveBeenCalledWith(
			mockSocket,
			mockReturnGamePacket,
			GamePacketType.destroyCardResponse,
		);
	});

	it('payload가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		(getGamePacketType as jest.Mock).mockReturnValue(null);

		await destroyCardHandler(mockSocket as GameSocket, mockGamePacket);

		expect(destroyCardUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});

	it('socket.userId가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		mockSocket.userId = undefined;

		await destroyCardHandler(mockSocket as GameSocket, mockGamePacket);

		expect(destroyCardUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});

	it('socket.roomId가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		mockSocket.roomId = undefined;

		await destroyCardHandler(mockSocket as GameSocket, mockGamePacket);

		expect(destroyCardUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});
});
