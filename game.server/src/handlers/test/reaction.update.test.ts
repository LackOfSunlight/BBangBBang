// reaction.update.test.ts
import reactionUpdateHandler from '../reaction.update.handler';
import { reactionUpdateUseCase } from '../../UseCase/reaction.update/reaction.update.usecase';

import { GameSocket } from '../../Type/game.socket';
import { GamePacket } from '../../generated/gamePacket';
import { GamePacketType } from '../../Enums/gamePacketType';
import { GlobalFailCode, ReactionType, CharacterStateType } from '../../generated/common/enums';

import * as roomUtils from '../../Utils/room.utils';
import * as sendDataUtil from '../../Sockets/send.data';
import * as notificationUtil from '../../Sockets/notification';

// Mock utils
jest.mock('dotenv', () => ({
	config: jest.fn(),
}));
/**dotenv 최신 버전(특히 dotenvx 플러그인 포함)은
 * 내부적으로 파일 감시(watcher)나 async 핸들을 열어두고
 * Jest는 그걸 “열린 핸들”로 인식해서 프로세스를 종료하지 못합니다. */

jest.mock('../../utils/send.data');
jest.mock('../../utils/notification.util');

describe('reactionUpdateHandler + reactionUpdateUseCase', () => {
	let mockSocket: GameSocket;
	let mockRoom: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockSocket = {
			userId: 'user1',
			roomId: 1,
		} as GameSocket;

		mockRoom = {
			id: 1,
			users: [
				{
					id: 'user1',
					nickname: 'tester',
					character: {
						hp: 3,
						equips: [],
						bbangCount: 0,
						stateInfo: {
							state: CharacterStateType.NONE_CHARACTER_STATE,
							stateTargetUserId: '0',
							nextStateAt: '0',
						},
					},
				},
			],
		};

		jest.spyOn(roomUtils, 'getRoom').mockReturnValue(mockRoom);
		jest.spyOn(roomUtils, 'saveRoom').mockImplementation(() => {});
		jest.spyOn(roomUtils, 'updateCharacterFromRoom').mockImplementation(() => {});
	});

	it('유저나 방정보가 없다면 INVALID_REQUEST 반환', async () => {
		const invalidSocket = { userId: undefined, roomId: undefined } as GameSocket;
		const packet: GamePacket = { payload: {} as any };

		await reactionUpdateHandler(invalidSocket, packet);

		expect(sendDataUtil.sendData).toHaveBeenCalledWith(
			invalidSocket,
			expect.objectContaining({
				payload: expect.objectContaining({
					reactionResponse: { success: false, failCode: GlobalFailCode.INVALID_REQUEST },
				}),
			}),
			GamePacketType.useCardResponse, // 잘못된 응답 타입
		);
	});

	it('올바른 정보가 들어오면 reactionUpdateUseCase로 데이터 전달', async () => {
		const packet: GamePacket = {
			payload: {
				oneofKind: GamePacketType.reactionRequest,
				reactionRequest: { reactionType: ReactionType.NONE_REACTION },
			},
		};

		await reactionUpdateHandler(mockSocket, packet);

		// handler → usecase 호출 후 정상 응답 전송
		expect(sendDataUtil.sendData).toHaveBeenCalledWith(
			mockSocket,
			expect.objectContaining({
				payload: expect.objectContaining({
					reactionResponse: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
				}),
			}),
			GamePacketType.reactionResponse,
		);

		// broadcast 호출 여부 확인
		expect(notificationUtil.broadcastDataToRoom).toHaveBeenCalledWith(
			mockRoom.users,
			expect.any(Object),
			GamePacketType.userUpdateNotification,
		);
	});

	it('BBANG_TARGET이고 자동 실드가 없다면 체력 1 감소 및 상태 초기화', async () => {
		const user = mockRoom.users[0];
		user.character.stateInfo.state = CharacterStateType.BBANG_TARGET;
		user.character.stateInfo.stateTargetUserId = 'shooter1';

		mockRoom.users.push({
			id: 'shooter1',
			character: {
				hp: 5,
				equips: [],
				bbangCount: 0,
				stateInfo: {
					state: CharacterStateType.NONE_CHARACTER_STATE,
					stateTargetUserId: '0',
					nextStateAt: '0',
				},
			},
		});

		const res = await reactionUpdateUseCase(mockSocket, ReactionType.NONE_REACTION);

		expect(res.success).toBe(true);
		expect(user.character.hp).toBe(2);
		expect(user.character.stateInfo.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
	});

	it('BIG_BBANG_TARGET이면 체력 1 감소 및 CheckBigBbangService 호출', async () => {
		const user = mockRoom.users[0];
		user.character.stateInfo.state = CharacterStateType.BIG_BBANG_TARGET;

		// mock service
		const checkBigBbangSpy = jest
			.spyOn(require('../../services/bigbbang.check.service'), 'CheckBigBbangService')
			.mockResolvedValue(mockRoom);

		const res = await reactionUpdateUseCase(mockSocket, ReactionType.NONE_REACTION);

		expect(res.success).toBe(true);
		expect(user.character.hp).toBe(2);
		expect(checkBigBbangSpy).toHaveBeenCalled();
	});

	it('GUERRILLA_TARGET 이면 체력 1 감소 및 CheckGuerrillaService호출', async () => {
		const user = mockRoom.users[0];
		user.character.stateInfo.state = CharacterStateType.GUERRILLA_TARGET;

		const checkGuerrillaSpy = jest
			.spyOn(require('../../services/guerrilla.check.service'), 'CheckGuerrillaService')
			.mockResolvedValue(mockRoom);

		const res = await reactionUpdateUseCase(mockSocket, ReactionType.NONE_REACTION);

		expect(res.success).toBe(true);
		expect(user.character.hp).toBe(2);
		expect(checkGuerrillaSpy).toHaveBeenCalled();
	});

	it('DEATH_MATCH_TURN_STATE이면 체력 1 감소 및 양측 플레이어 상태 초기화', async () => {
		const user = mockRoom.users[0];
		user.character.stateInfo.state = CharacterStateType.DEATH_MATCH_TURN_STATE;
		user.character.stateInfo.stateTargetUserId = 'enemy1';

		mockRoom.users.push({
			id: 'enemy1',
			character: {
				hp: 5,
				stateInfo: {
					state: CharacterStateType.DEATH_MATCH_STATE,
					stateTargetUserId: 'user1',
					nextStateAt: '0',
				},
			},
		});

		const res = await reactionUpdateUseCase(mockSocket, ReactionType.NONE_REACTION);

		expect(res.success).toBe(true);
		expect(user.character.hp).toBe(2);
		expect(user.character.stateInfo.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(mockRoom.users[1].character.stateInfo.state).toBe(
			CharacterStateType.NONE_CHARACTER_STATE,
		);
	});

	it('DEATH_MATCH_STATE이면 대기', async () => {
		const user = mockRoom.users[0];
		user.character.stateInfo.state = CharacterStateType.DEATH_MATCH_STATE;

		const res = await reactionUpdateUseCase(mockSocket, ReactionType.NONE_REACTION);

		expect(res.success).toBe(true);
		expect(user.character.hp).toBe(3); // HP unchanged
	});
});
