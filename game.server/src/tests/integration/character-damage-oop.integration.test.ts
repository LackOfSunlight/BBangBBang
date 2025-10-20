import { CharacterType, RoleType, CardType } from '../../generated/common/enums';
import { CharacterStateInfoData } from '../../generated/common/types';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { CharacterDamageService } from '../../services/character.damage.service';
import { DamageResult } from '../../models/character.model';

describe('CharacterDamageService - OOP 방식 데미지 처리', () => {
	let room: Room;
	let user1: User; // 말랑이
	let user2: User; // 핑크슬라임
	let user3: User; // 마스크맨
	let shooter: User; // 공격자

	beforeEach(() => {
		// 완전한 테스트 격리를 위한 고유 ID 생성
		const uniqueId = Math.floor(Math.random() * 10000) + Date.now();
		
		// Room 초기화 (id, ownerId, name, maxUserNum, state, users)
		room = new Room(uniqueId, 'test-host', 'Test Room', 4, 0, []);
		room.roomDecks = []; // 테스트 격리를 위해 덱 초기화
		room.users = []; // 사용자 목록도 초기화

		// 공통 상태 정보
		const stateInfo: CharacterStateInfoData = {
			state: 0,
			nextState: 0,
			nextStateAt: '0',
			stateTargetUserId: '0'
		};

		// User1: 말랑이
		user1 = new User(`user1_${uniqueId}`, 'Player1');
		user1.setCharacter({
			characterType: CharacterType.MALANG,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			stateInfo,
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		// User2: 핑크슬라임
		user2 = new User(`user2_${uniqueId}`, 'Player2');
		user2.setCharacter({
			characterType: CharacterType.PINK_SLIME,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			stateInfo,
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		// User3: 마스크맨
		user3 = new User(`user3_${uniqueId}`, 'Player3');
		user3.setCharacter({
			characterType: CharacterType.MASK,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			stateInfo,
			equips: [],
			debuffs: [],
			handCards: [{ type: CardType.SHIELD, count: 1 }],
			bbangCount: 0,
			handCardsCount: 1,
		});

		// Shooter: 공격자
		shooter = new User(`shooter_${uniqueId}`, 'Shooter');
		shooter.setCharacter({
			characterType: CharacterType.RED,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			stateInfo,
			equips: [],
			debuffs: [],
			handCards: [
				{ type: CardType.SHIELD, count: 2 },
				{ type: CardType.HAND_GUN, count: 1 }
			],
			bbangCount: 0,
			handCardsCount: 3,
		});

		// Room에 사용자 추가
		room.addUserToRoom(user1);
		room.addUserToRoom(user2);
		room.addUserToRoom(user3);
		room.addUserToRoom(shooter);

		// Room 덱에 카드 추가
		room.roomDecks = [
			CardType.SHIELD,
			CardType.HAND_GUN,
			CardType.VACCINE,
			CardType.SHIELD
		];
	});

	describe('기본 데미지 처리', () => {
		test('일반 캐릭터가 데미지를 받으면 HP가 감소한다', () => {
			const initialHp = user1.character!.hp;
			const damage = 2;

			const result = CharacterDamageService.processDamage(room, user1, damage);

			expect(result.success).toBe(true);
			expect(result.defended).toBe(false);
			expect(user1.character!.hp).toBe(initialHp - damage);
		});

		test('음수 데미지는 HP를 증가시킨다', () => {
			const initialHp = user1.character!.hp;
			const negativeDamage = -1;

			const result = CharacterDamageService.processDamage(room, user1, negativeDamage);

			expect(result.success).toBe(true);
			expect(user1.character!.hp).toBe(initialHp + 1);
		});
	});

	describe('방어 로직', () => {
		test('Auto Shield가 있으면 25% 확률로 방어한다', () => {
			// Auto Shield 장착
			user1.character!.equips = [CardType.AUTO_SHIELD];
			
			// Math.random을 모킹하여 방어 성공하도록 설정
			const mockMath = Object.create(global.Math);
			mockMath.random = () => 0.1; // 25% 미만으로 설정
			global.Math = mockMath;

			const initialHp = user1.character!.hp;
			const result = CharacterDamageService.processDamage(room, user1, 2);

			// 방어 성공 시 HP가 감소하지 않아야 함
			expect(result.defended).toBe(true);
			expect(user1.character!.hp).toBe(initialHp);
		});

		test('Froggy는 25% 확률로 방어한다', () => {
			// Froggy로 변경
			user1.character!.characterType = CharacterType.FROGGY;
			
			// Math.random을 모킹하여 방어 성공하도록 설정
			const mockMath = Object.create(global.Math);
			mockMath.random = () => 0.1; // 25% 미만으로 설정
			global.Math = mockMath;

			const initialHp = user1.character!.hp;
			const result = CharacterDamageService.processDamage(room, user1, 2);

			expect(result.defended).toBe(true);
			expect(user1.character!.hp).toBe(initialHp);
		});
	});

	describe('말랑이 특수 능력', () => {
		test('말랑이가 데미지를 받으면 덱에서 카드를 1장 뽑는다', () => {
			const initialDeckSize = room.roomDecks.length;
			const initialHandCardsCount = user1.character!.handCardsCount;

			const result = CharacterDamageService.processDamage(room, user1, 1);

			expect(result.success).toBe(true);
			expect(result.cardDrawn).toBe(true);
			expect(user1.character!.handCardsCount).toBe(initialHandCardsCount + 1);
			expect(room.roomDecks.length).toBe(initialDeckSize - 1);
		});

		test('덱에 카드가 없으면 카드를 뽑지 않는다', () => {
			room.roomDecks = []; // 덱을 비움
			const initialHandCardsCount = user1.character!.handCardsCount;

			const result = CharacterDamageService.processDamage(room, user1, 1);

			expect(result.success).toBe(true);
			expect(result.cardDrawn).toBe(false);
			expect(user1.character!.handCardsCount).toBe(initialHandCardsCount);
		});
	});

	describe('핑크슬라임 특수 능력', () => {
		test('핑크슬라임이 데미지를 받으면 공격자의 카드 1장을 훔친다', () => {
			// 완전히 새로운 사용자와 Room 생성 (테스트 격리)
			const uniqueId = Math.floor(Math.random() * 10000) + Date.now();
			const testShooter = new User(`test-shooter-${uniqueId}`, 'TestShooter');
			const testPinkSlime = new User(`test-pink-${uniqueId}`, 'TestPinkSlime');
			const testRoom = new Room(uniqueId, 'test-host', 'Test Room', 4, 0, []);
			
			// 공격자 설정
			testShooter.setCharacter({
				characterType: CharacterType.RED,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: 0,
				stateInfo: {
					state: 0,
					nextState: 0,
					nextStateAt: '0',
					stateTargetUserId: '0'
				},
				equips: [],
				debuffs: [],
				handCards: [
					{ type: CardType.SHIELD, count: 2 },
					{ type: CardType.HAND_GUN, count: 1 }
				],
				bbangCount: 0,
				handCardsCount: 3,
			});
			
			// 핑크슬라임 설정
			testPinkSlime.setCharacter({
				characterType: CharacterType.PINK_SLIME,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: 0,
				stateInfo: {
					state: 0,
					nextState: 0,
					nextStateAt: '0',
					stateTargetUserId: '0'
				},
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 0,
				handCardsCount: 0,
			});

			// 새로운 Room에 사용자 추가
			testRoom.addUserToRoom(testShooter);
			testRoom.addUserToRoom(testPinkSlime);

			const initialShooterHandCount = testShooter.character!.handCardsCount;
			const initialPinkSlimeHandCount = testPinkSlime.character!.handCardsCount;

			const result = CharacterDamageService.processDamage(testRoom, testPinkSlime, 1, testShooter);

			expect(result.success).toBe(true);
			expect(result.cardStolen).toBe(true);
			expect(testShooter.character!.handCardsCount).toBe(initialShooterHandCount - 1);
			expect(testPinkSlime.character!.handCardsCount).toBe(initialPinkSlimeHandCount + 1);
		});

		test('공격자가 카드를 가지고 있지 않으면 훔치지 않는다', () => {
			shooter.character!.handCards = [];
			shooter.character!.handCardsCount = 0;
			const initialPinkSlimeHandCount = user2.character!.handCardsCount;

			const result = CharacterDamageService.processDamage(room, user2, 1, shooter);

			expect(result.success).toBe(true);
			expect(result.cardStolen).toBe(false);
			expect(user2.character!.handCardsCount).toBe(initialPinkSlimeHandCount);
		});

		test('공격자가 없으면 훔치지 않는다', () => {
			const initialHandCount = user2.character!.handCardsCount;

			const result = CharacterDamageService.processDamage(room, user2, 1);

			expect(result.success).toBe(true);
			expect(result.cardStolen).toBe(false);
			expect(user2.character!.handCardsCount).toBe(initialHandCount);
		});
	});

	describe('마스크맨 사망 처리', () => {
		test('마스크맨이 살아있을 때 플레이어가 죽으면 핸드카드를 마스크맨에게 전달한다', () => {
			// 완전히 새로운 사용자와 Room 생성 (테스트 격리)
			const uniqueId = Math.floor(Math.random() * 10000) + Date.now();
			const testDyingUser = new User(`dying-${uniqueId}`, 'DyingUser');
			const testMaskMan = new User(`maskman-${uniqueId}`, 'MaskMan');
			const testRoom = new Room(uniqueId, 'test-host', 'Test Room', 4, 0, []);

			const stateInfo: CharacterStateInfoData = {
				state: 0,
				nextState: 0,
				nextStateAt: '0',
				stateTargetUserId: '0'
			};

			// 죽을 플레이어 설정
			testDyingUser.setCharacter({
				characterType: CharacterType.MALANG,
				roleType: RoleType.TARGET,
				hp: 1, // HP를 1로 설정하여 데미지 10으로 죽게 함
				weapon: 0,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [
					{ type: CardType.SHIELD, count: 1 },
					{ type: CardType.HAND_GUN, count: 1 }
				],
				bbangCount: 0,
				handCardsCount: 2,
			});

			// 마스크맨 설정
			testMaskMan.setCharacter({
				characterType: CharacterType.MASK,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: 0,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 0,
				handCardsCount: 0,
			});

			// Room에 사용자 추가
			testRoom.addUserToRoom(testDyingUser);
			testRoom.addUserToRoom(testMaskMan);

			const initialMaskManHandCount = testMaskMan.character!.handCardsCount;

			// 치명적인 데미지로 죽이기
			const result = CharacterDamageService.processDamage(testRoom, testDyingUser, 10);

			expect(result.success).toBe(true);
			expect(testDyingUser.character!.hp).toBe(0);
			expect(testMaskMan.character!.handCardsCount).toBe(initialMaskManHandCount + 2);
			expect(testDyingUser.character!.handCardsCount).toBe(0);
		});

		test('마스크맨이 죽었을 때 플레이어가 죽으면 모든 카드가 월드덱으로 반환된다', () => {
			// 마스크맨을 먼저 죽임
			user3.character!.hp = 0;

			// 죽을 플레이어에게 카드 추가
			user1.character!.handCards = [
				{ type: CardType.SHIELD, count: 1 },
				{ type: CardType.HAND_GUN, count: 1 }
			];
			user1.character!.handCardsCount = 2;

			const initialDeckSize = room.roomDecks.length;

			// 치명적인 데미지로 죽이기
			const result = CharacterDamageService.processDamage(room, user1, 10);

			expect(result.success).toBe(true);
			expect(user1.character!.hp).toBe(0);
			expect(room.roomDecks.length).toBe(initialDeckSize + 2); // 핸드카드 2장이 월드덱으로 반환
		});
	});

	describe('에지 케이스', () => {
		test('캐릭터가 없는 사용자는 데미지 처리가 실패한다', () => {
			const userWithoutCharacter = new User('no-char', 'NoChar');
			room.addUserToRoom(userWithoutCharacter);

			const result = CharacterDamageService.processDamage(room, userWithoutCharacter, 1);

			expect(result.success).toBe(false);
			expect(result.defended).toBe(false);
		});
	});
});
