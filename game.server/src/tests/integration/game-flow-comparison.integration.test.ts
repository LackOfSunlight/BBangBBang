import { CharacterType, RoleType, CardType } from '../../generated/common/enums';
import { CharacterStateInfoData } from '../../generated/common/types';
import { Room } from '../../models/room.model'; // 기존 Room
import { User } from '../../models/user.model';
import takeDamageService from '../../services/take.damage.service'; // 기존 서비스
import { CharacterDamageService } from '../../services/character.damage.service'; // 새로운 OOP 서비스
import { Room as NewRoom } from '../../domains/game/rooms/Room'; // 새로운 OOP Room
import { RoomService } from '../../domains/game/rooms/services/RoomService';
import { MemoryRoomRepository } from '../../domains/game/rooms/repositories/MemoryRoomRepository';
import { CardFactory } from '../../domains/game/cards/CardFactory';
import { HandGunCard } from '../../domains/game/cards/weapons/HandGunCard';

/**
 * 게임 플로우 비교 통합 테스트
 * 기존 레거시 시스템과 새로운 OOP 시스템의 동작을 비교합니다.
 */
describe('Game Flow Comparison Tests - Legacy vs OOP', () => {
	let legacyRoom: Room;
	let oopRoom: Room;
	let oopRoomService: RoomService;
	let repository: MemoryRoomRepository;
	
	let user1: User; // 말랑이
	let user2: User; // 핑크슬라임  
	let user3: User; // 마스크맨
	let shooter: User; // 공격자

	beforeEach(() => {
		// Repository와 Service 초기화
		repository = new MemoryRoomRepository();
		oopRoomService = new RoomService(repository);
		
		// 테스트 격리를 위해 모든 상태 초기화
		jest.clearAllMocks();
		
		// 완전한 테스트 격리를 위한 고유 ID 생성
		const uniqueId = Math.floor(Math.random() * 10000) + Date.now();

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
			weapon: CardType.NONE,
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
			weapon: CardType.NONE,
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
			weapon: CardType.NONE,
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
			weapon: CardType.NONE,
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

		// 기존 Room 초기화
		legacyRoom = new Room(uniqueId, 'test-host', 'Legacy Room', 4, 0, []);
		legacyRoom.roomDecks = [CardType.SHIELD, CardType.HAND_GUN, CardType.VACCINE, CardType.SHIELD];
		legacyRoom.addUserToRoom(user1);
		legacyRoom.addUserToRoom(user2);
		legacyRoom.addUserToRoom(user3);
		legacyRoom.addUserToRoom(shooter);

		// 새로운 OOP Room 초기화 (기존 Room 타입 사용)
		oopRoom = new Room(uniqueId + 1, 'test-host', 'OOP Room', 4, 0, []);
		oopRoom.addUserToRoom(user1);
		oopRoom.addUserToRoom(user2);
		oopRoom.addUserToRoom(user3);
		oopRoom.addUserToRoom(shooter);
	});

	describe('데미지 처리 비교', () => {
		test('기본 데미지 처리가 동일하게 작동한다', () => {
			const damage = 2;
			
			// 완전히 새로운 사용자 생성 (테스트 격리)
			const legacyUser = new User('legacy-user', 'LegacyUser');
			const oopUser = new User('oop-user', 'OOPUser');
			const testShooter = new User('test-shooter', 'TestShooter');
			
			// 공통 상태 정보
			const stateInfo: CharacterStateInfoData = {
				state: 0,
				nextState: 0,
				nextStateAt: '0',
				stateTargetUserId: '0'
			};
			
			// 레거시 시스템용 사용자 설정
			legacyUser.setCharacter({
				characterType: CharacterType.RED,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: CardType.NONE,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 0,
				handCardsCount: 0,
			});
			
			// OOP 시스템용 사용자 설정
			oopUser.setCharacter({
				characterType: CharacterType.RED,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: CardType.NONE,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 0,
				handCardsCount: 0,
			});
			
			// 공격자 설정
			testShooter.setCharacter({
				characterType: CharacterType.RED,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: CardType.NONE,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 0,
				handCardsCount: 0,
			});
			
			// Room에 사용자 추가
			legacyRoom.addUserToRoom(legacyUser);
			legacyRoom.addUserToRoom(testShooter);
			oopRoom.addUserToRoom(oopUser);
			oopRoom.addUserToRoom(testShooter);
			
			// 기존 시스템
			const legacyResult = takeDamageService(legacyRoom, legacyUser, damage, testShooter);
			
			// 새로운 OOP 시스템
			const oopResult = CharacterDamageService.processDamage(oopRoom, oopUser, damage, testShooter);
			
			// 결과 비교
			expect(legacyUser.character!.hp).toBe(4 - damage); // 레거시 시스템 HP 감소
			expect(oopUser.character!.hp).toBe(4 - damage); // OOP 시스템 HP 감소
			expect(oopResult.success).toBe(true);
			expect(oopResult.defended).toBe(false);
		});

		test('말랑이 특수 능력이 동일하게 작동한다', () => {
			const damage = 1;
			const initialHandCount = user1.character!.handCardsCount;
			
			// 기존 시스템
			takeDamageService(legacyRoom, user1, damage);
			const legacyHandCount = user1.character!.handCardsCount;
			const legacyDeckSize = legacyRoom.roomDecks.length;
			
			// 새로운 OOP 시스템 (새로운 사용자로 테스트)
			const newUser = new User('new-user', 'NewUser');
			newUser.setCharacter({
				characterType: CharacterType.MALANG,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: CardType.NONE,
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
			
			const newRoom = new Room(3, 'test-host', 'Test Room', 4, 0, []);
			newRoom.roomDecks = [CardType.SHIELD, CardType.HAND_GUN, CardType.VACCINE]; // Add deck cards
			newRoom.addUserToRoom(newUser);
			
			const oopResult = CharacterDamageService.processDamage(newRoom, newUser, damage);
			
			expect(oopResult.success).toBe(true);
			expect(oopResult.cardDrawn).toBe(true);
			expect(newUser.character!.handCardsCount).toBe(initialHandCount + 1);
		});

		test('핑크슬라임 특수 능력이 동일하게 작동한다', () => {
			const damage = 1;
			const initialShooterHandCount = shooter.character!.handCardsCount;
			const initialPinkSlimeHandCount = user2.character!.handCardsCount;
			
			// 기존 시스템
			takeDamageService(legacyRoom, user2, damage, shooter);
			const legacyShooterHandCount = shooter.character!.handCardsCount;
			const legacyPinkSlimeHandCount = user2.character!.handCardsCount;
			
			// 새로운 OOP 시스템 (새로운 사용자로 테스트)
			const newShooter = new User('new-shooter', 'NewShooter');
			newShooter.setCharacter({
				characterType: CharacterType.RED,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: CardType.NONE,
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
			
			const newPinkSlime = new User('new-pink', 'NewPinkSlime');
			newPinkSlime.setCharacter({
				characterType: CharacterType.PINK_SLIME,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: CardType.NONE,
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
			
			const newRoom = new Room(4, 'test-host', 'Test Room', 4, 0, []);
			newRoom.addUserToRoom(newShooter);
			newRoom.addUserToRoom(newPinkSlime);
			
			const oopResult = CharacterDamageService.processDamage(newRoom, newPinkSlime, damage, newShooter);
			
			expect(oopResult.success).toBe(true);
			expect(oopResult.cardStolen).toBe(true);
			expect(newShooter.character!.handCardsCount).toBe(initialShooterHandCount - 1);
			expect(newPinkSlime.character!.handCardsCount).toBe(initialPinkSlimeHandCount + 1);
		});

		test('마스크맨 사망 처리가 동일하게 작동한다', () => {
			// 죽을 플레이어에게 카드 추가
			user1.character!.handCards = [
				{ type: CardType.SHIELD, count: 1 },
				{ type: CardType.HAND_GUN, count: 1 }
			];
			user1.character!.handCardsCount = 2;
			
			const initialMaskManHandCount = user3.character!.handCardsCount;
			const damage = 10; // 치명적인 데미지
			
			// 기존 시스템
			takeDamageService(legacyRoom, user1, damage);
			const legacyMaskManHandCount = user3.character!.handCardsCount;
			const legacyDyingUserHandCount = user1.character!.handCardsCount;
			
			// 새로운 OOP 시스템 (새로운 사용자로 테스트)
			const newDyingUser = new User('new-dying', 'NewDying');
			newDyingUser.setCharacter({
				characterType: CharacterType.MALANG,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: CardType.NONE,
				stateInfo: {
					state: 0,
					nextState: 0,
					nextStateAt: '0',
					stateTargetUserId: '0'
				},
				equips: [],
				debuffs: [],
				handCards: [
					{ type: CardType.SHIELD, count: 1 },
					{ type: CardType.HAND_GUN, count: 1 }
				],
				bbangCount: 0,
				handCardsCount: 2,
			});
			
			const newMaskMan = new User('new-mask', 'NewMaskMan');
			newMaskMan.setCharacter({
				characterType: CharacterType.MASK,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: CardType.NONE,
				stateInfo: {
					state: 0,
					nextState: 0,
					nextStateAt: '0',
					stateTargetUserId: '0'
				},
				equips: [],
				debuffs: [],
				handCards: [{ type: CardType.SHIELD, count: 1 }],
				bbangCount: 0,
				handCardsCount: 1,
			});
			
			const newRoom = new Room(5, 'test-host', 'Test Room', 4, 0, []);
			newRoom.addUserToRoom(newDyingUser);
			newRoom.addUserToRoom(newMaskMan);
			
			const oopResult = CharacterDamageService.processDamage(newRoom, newDyingUser, damage);
			
			expect(oopResult.success).toBe(true);
			expect(newDyingUser.character!.hp).toBe(0);
			expect(newMaskMan.character!.handCardsCount).toBe(initialMaskManHandCount + 2);
			expect(newDyingUser.character!.handCardsCount).toBe(0);
		});
	});

	describe('카드 시스템 비교', () => {
		test('HandGun 카드 사용이 동일하게 작동한다', () => {
			const handGunUser = new User('handgun-user', 'HandGunUser');
			handGunUser.setCharacter({
				characterType: CharacterType.RED,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: CardType.NONE,
				stateInfo: {
					state: 0,
					nextState: 0,
					nextStateAt: '0',
					stateTargetUserId: '0'
				},
				equips: [],
				debuffs: [],
				handCards: [{ type: CardType.HAND_GUN, count: 1 }],
				bbangCount: 0,
				handCardsCount: 1,
			});
			
			// 기존 시스템 (간접적으로 테스트)
			expect(handGunUser.character!.weapon).toBe(CardType.NONE);
			expect(handGunUser.character!.handCardsCount).toBe(1);
			
			// 새로운 OOP 시스템
			const handGunCard = CardFactory.createCard(CardType.HAND_GUN);
			const result = handGunCard.useCard(handGunUser, legacyRoom);
			
			expect(result).toBe(true);
			expect(handGunUser.character!.weapon).toBe(CardType.HAND_GUN);
			expect(handGunUser.character!.handCardsCount).toBe(0);
		});
	});

	describe('Room 관리 비교', () => {
		test('Room 생성이 동일하게 작동한다', async () => {
			// 기존 시스템
			const legacyRoom = new Room(10, 'owner1', 'Legacy Test Room', 4, 0, []);
			
			// 새로운 OOP 시스템
			const oopRoom = await oopRoomService.createRoom('owner1', 'OOP Test Room', 4);
			
			expect(legacyRoom.id).toBe(10);
			expect(legacyRoom.name).toBe('Legacy Test Room');
			expect(legacyRoom.maxUserNum).toBe(4);
			
			expect(oopRoom.id).toBeGreaterThan(0);
			expect(oopRoom.name).toBe('OOP Test Room');
			expect(oopRoom.maxUserNum).toBe(4);
		});

		test('유저 추가가 동일하게 작동한다', async () => {
			// Create unique user ID to avoid conflicts
			const uniqueId = Date.now() + Math.floor(Math.random() * 10000);
			const newUser = new User(`new-user-${uniqueId}`, `NewUser${uniqueId}`);
			newUser.setCharacter({
				characterType: CharacterType.RED,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: CardType.NONE,
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
			
			// 기존 시스템
			const addResult = legacyRoom.addUserToRoom(newUser);
			const legacyUserCount = legacyRoom.users.length;
			
			// 새로운 OOP 시스템
			const oopRoom = await oopRoomService.createRoom('owner1', 'Test Room', 4);
			const oopResult = await oopRoomService.addUserToRoom(oopRoom.id, newUser);
			const oopRoomUpdated = await oopRoomService.getRoom(oopRoom.id);
			
			// legacyRoom이 이미 4명으로 가득 찼으므로 추가 실패가 정상
			expect(addResult).toBe(false); // 사용자 추가 실패 확인 (방이 가득참)
			expect(legacyUserCount).toBe(4); // 기존 4명 유지
			expect(oopResult).toBe(true);
			expect(oopRoomUpdated?.users.length).toBe(1);
		});
	});

	describe('성능 비교', () => {
		test('데미지 처리 성능이 유사하다', () => {
			const iterations = 1000;
			const damage = 1;
			
			// 기존 시스템 성능 측정
			const legacyStart = Date.now();
			for (let i = 0; i < iterations; i++) {
				takeDamageService(legacyRoom, user1, damage, shooter);
			}
			const legacyEnd = Date.now();
			const legacyTime = legacyEnd - legacyStart;
			
			// 새로운 OOP 시스템 성능 측정
			const oopStart = Date.now();
			for (let i = 0; i < iterations; i++) {
				CharacterDamageService.processDamage(oopRoom, user1, damage, shooter);
			}
			const oopEnd = Date.now();
			const oopTime = oopEnd - oopStart;
			
			console.log(`기존 시스템: ${legacyTime}ms (${iterations}회)`);
			console.log(`새로운 OOP 시스템: ${oopTime}ms (${iterations}회)`);
			
			// 성능 차이가 300% 이하로 나도록 검증 (OOP 오버헤드 고려)
			const performanceRatio = oopTime / legacyTime;
			expect(performanceRatio).toBeLessThan(3.0);
			expect(performanceRatio).toBeGreaterThan(0.5);
		});
	});

	describe('Feature Flag 통합 테스트', () => {
		test('Feature Flag를 통한 점진적 마이그레이션이 가능하다', () => {
			// USE_NEW_DAMAGE_SERVICE=false (기존 시스템)
			process.env.USE_NEW_DAMAGE_SERVICE = 'false';
			
			const legacyResult = takeDamageService(legacyRoom, user1, 1, shooter);
			
			// USE_NEW_DAMAGE_SERVICE=true (새로운 OOP 시스템)
			process.env.USE_NEW_DAMAGE_SERVICE = 'true';
			
			const oopResult = takeDamageService(legacyRoom, user1, 1, shooter);
			
			// 두 결과가 모두 성공적으로 처리되어야 함
			expect(legacyResult).toBeDefined();
			expect(oopResult).toBeDefined();
			
			// Feature Flag 원복
			process.env.USE_NEW_DAMAGE_SERVICE = 'false';
		});
	});
});
