import * as redisUtil from '../../utils/redis.util';
import { sendData } from '../../utils/send.data';
import { broadcastDataToRoom } from '../../utils/notification.util';
import useCardRequestHandler from '../../handlers/request/use.card.request.handler';
import reactionRequestHandler from '../../handlers/request/reaction.request.handler';
import { GameSocket } from '../../type/game.socket';
import {
	CardType,
	CharacterStateType,
	CharacterType,
	GlobalFailCode,
	ReactionType,
	RoleType,
} from '../../generated/common/enums';
import { RoomData, UserData } from '../../generated/common/types';
import { GamePacket } from '../../generated/gamePacket';
import { GamePacketType } from '../../enums/gamePacketType';
import * as weaponUtil from '../../utils/weapon.util';

// Mock 유틸리티
jest.mock('../../utils/send.data');
jest.mock('../../utils/notification.util');
jest.mock('../../utils/weapon.util');

// 일반 객체 깊은 복사를 위한 헬퍼
const cloneDeep = (obj: any) => JSON.parse(JSON.stringify(obj));

describe('카드 효과: 데저트 이글', () => {
	const ROOM_ID = 1;
	const USER_ID = 'user-1';
	const TARGET_USER_ID = 'user-2';

	let socket: GameSocket;
	let baseUser: UserData;
	let baseTarget: UserData;
	let baseRoom: RoomData;
	let gamePacket: GamePacket;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks(); // 모든 스파이 초기화

		socket = {
			userId: USER_ID,
			roomId: ROOM_ID,
		} as GameSocket;

		baseUser = {
			id: USER_ID,
			nickname: 'test-user',
			character: {
				characterType: CharacterType.PINK_SLIME,
				roleType: RoleType.HITMAN,
				hp: 3,
				weapon: CardType.NONE,
				equips: [],
				debuffs: [],
				handCards: [],
				handCardsCount: 0,
				stateInfo: {
					state: CharacterStateType.BBANG_SHOOTER,
					stateTargetUserId: '',
					nextState: 0,
					nextStateAt: '0',
				},
				bbangCount: 0,
			},
		};

		baseTarget = {
			id: TARGET_USER_ID,
			nickname: 'target-user',
			character: {
				characterType: CharacterType.RED,
				roleType: RoleType.TARGET,
				hp: 3,
				weapon: CardType.NONE,
				equips: [],
				debuffs: [],
				handCards: [],
				handCardsCount: 0,
				stateInfo: {
					state: CharacterStateType.BBANG_TARGET,
					stateTargetUserId: '',
					nextState: CharacterStateType.NONE_CHARACTER_STATE,
					nextStateAt: '0',
				},
				bbangCount: 0,
			},
		};

		baseRoom = {
			id: ROOM_ID,
			ownerId: USER_ID,
			name: 'Test Room',
			maxUserNum: 4,
			state: 0, // RoomState.WAIT으로 가정
			users: [baseUser, baseTarget],
		};
	});

	describe('useCardRequestHandler: 데저트 이글 장착', () => {
		it('데저트 이글을 장착하고 손에서 카드를 제거해야 합니다', async () => {
			// Arrange: 테스트 준비
			const userForTest = cloneDeep(baseUser);
			userForTest.character!.handCards = [{ type: CardType.DESERT_EAGLE, count: 1 }];
			userForTest.character!.handCardsCount = 1;

			// 테스트를 위한 상태 저장용 Mock DB
			let dbUser = cloneDeep(userForTest);

			const getUserFromRoomSpy = jest
				.spyOn(redisUtil, 'getUserFromRoom')
				.mockImplementation(async (roomId, userId) => {
					return cloneDeep(dbUser);
				});

			const updateCharacterFromRoomSpy = jest
				.spyOn(redisUtil, 'updateCharacterFromRoom')
				.mockImplementation(async (roomId, userId, character) => {
					dbUser.character = character;
					return {} as any;
				});

			gamePacket = {
				payload: {
					oneofKind: GamePacketType.useCardRequest,
					useCardRequest: {
						cardType: CardType.DESERT_EAGLE,
						targetUserId: USER_ID, // 장착 시에는 자기 자신을 타겟으로
					},
				},
			};

			// Act: 테스트할 동작 실행
			await useCardRequestHandler(socket, gamePacket);

			// Assert: 결과 검증
			expect(updateCharacterFromRoomSpy).toHaveBeenCalledTimes(2);

			// 첫 번째 호출: 손에서 카드가 제거됨
			const firstCallCharacter = updateCharacterFromRoomSpy.mock.calls[0][2];
			expect(firstCallCharacter.handCards).toEqual([]);
			expect(firstCallCharacter.handCardsCount).toBe(0);
			expect(firstCallCharacter.weapon).toBe(CardType.NONE);

			// 두 번째 호출: 무기가 장착됨
			const secondCallCharacter = updateCharacterFromRoomSpy.mock.calls[1][2];
			expect(secondCallCharacter.weapon).toBe(CardType.DESERT_EAGLE);
			// 두 번째 호출 시점에도 손의 카드는 비어있어야 함
			expect(secondCallCharacter.handCards).toEqual([]);
		});
	});

	describe('reactionRequestHandler: 데저트 이글로 빵야', () => {
		let attacker: UserData;
		let target: UserData;
		let targetSocket: GameSocket;

		beforeEach(() => {
			attacker = cloneDeep(baseUser);
			attacker.character!.weapon = CardType.DESERT_EAGLE;
			attacker.character!.stateInfo!.state = CharacterStateType.BBANG_SHOOTER;
			attacker.character!.stateInfo!.stateTargetUserId = TARGET_USER_ID;

			target = cloneDeep(baseTarget);
			target.character!.hp = 3;
			target.character!.stateInfo!.state = CharacterStateType.BBANG_TARGET;
			target.character!.stateInfo!.stateTargetUserId = USER_ID;

			const room = cloneDeep(baseRoom);
			room.users = [attacker, target];

			targetSocket = {
				userId: TARGET_USER_ID,
				roomId: ROOM_ID,
			} as GameSocket;

			jest.spyOn(redisUtil, 'getRoom').mockResolvedValue(room);
			jest.spyOn(redisUtil, 'getUserFromRoom').mockImplementation(async (roomId, userId) => {
				if (userId === TARGET_USER_ID) return cloneDeep(target);
				if (userId === USER_ID) return cloneDeep(attacker);
				return null;
			});
		});

		it('상대방에게 2의 데미지를 입히고, 상태와 카운트를 정확히 업데이트해야 합니다', async () => {
			// Arrange: 테스트 준비
			jest.spyOn(weaponUtil, 'weaponDamageEffect').mockReturnValue(2);
			const saveRoomSpy = jest.spyOn(redisUtil, 'saveRoom').mockResolvedValue({} as any);

			gamePacket = {
				payload: {
					oneofKind: GamePacketType.reactionRequest,
					reactionRequest: {
						reactionType: ReactionType.NONE_REACTION,
					},
				},
			};

			// Act: 테스트할 동작 실행
			await reactionRequestHandler(targetSocket, gamePacket);

			// Assert: 결과 검증
			expect(saveRoomSpy).toHaveBeenCalledTimes(1);
			const savedRoom = saveRoomSpy.mock.calls[0][0] as RoomData;

			const updatedTarget = savedRoom.users.find((u) => u.id === TARGET_USER_ID);
			const updatedAttacker = savedRoom.users.find((u) => u.id === USER_ID);

			// 피격자 검증
			expect(updatedTarget?.character?.hp).toBe(1);
			expect(updatedTarget?.character?.stateInfo?.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);

			// 공격자 검증
			expect(updatedAttacker?.character?.stateInfo?.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(updatedAttacker?.character?.bbangCount).toBe(1);

			// 알림 전송 검증
			expect(broadcastDataToRoom).toHaveBeenCalled();
		});
	});
});