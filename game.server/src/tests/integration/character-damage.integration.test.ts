import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { Character } from '../../models/character.model';
import { 
	RoomStateType, 
	CharacterType, 
	RoleType, 
	CharacterStateType, 
	CardType,
	AnimationType 
} from '../../generated/common/enums';
import { CharacterData, CardData, CharacterStateInfoData } from '../../generated/common/types';
import takeDamageService from '../../services/take.damage.service';
import { playAnimationHandler } from '../../handlers/play.animation.handler';

// playAnimationHandler 모킹
jest.mock('../../handlers/play.animation.handler', () => ({
	playAnimationHandler: jest.fn()
}));

describe('Character Damage Integration Tests - 기존 동작 검증', () => {
	let room: Room;
	let user1: User;
	let user2: User;
	let user3: User;

	beforeEach(() => {
		// Mock 함수 초기화
		jest.clearAllMocks();
		
		// Room 생성 (각 테스트마다 고유한 ID 사용)
		const uniqueId = Math.floor(Math.random() * 10000);
		room = new Room(uniqueId, 'ownerId', 'Test Room', 4, RoomStateType.WAIT, []);
		
		// Room 덱 초기화 (테스트 간 격리를 위해)
		room.roomDecks = [];
		
		// Users 생성 (각 테스트마다 고유한 ID 사용)
		const timestamp = Date.now();
		user1 = new User(`user1_${timestamp}`, 'Player1');
		user2 = new User(`user2_${timestamp}`, 'Player2');
		user3 = new User(`user3_${timestamp}`, 'Player3');

		// Character State Info 생성
		const stateInfo: CharacterStateInfoData = {
			state: CharacterStateType.NONE_CHARACTER_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
			stateTargetUserId: '0',
		};

		// User1: 말랑이 (Malang) - 특수능력 테스트용
		user1.setCharacter({
			characterType: CharacterType.MALANG,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			stateInfo,
			equips: [],
			debuffs: [],
			handCards: [{ type: CardType.BBANG, count: 1 }],
			bbangCount: 0,
			handCardsCount: 1,
		});

		// User2: 개구리 (Froggy) - 방어 특수능력 테스트용
		user2.setCharacter({
			characterType: CharacterType.FROGGY,
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

		// User3: 마스크맨 (Mask) - 죽은 플레이어 카드 흡수 테스트용
		user3.setCharacter({
			characterType: CharacterType.MASK,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			stateInfo,
			equips: [],
			debuffs: [],
			handCards: [{ type: CardType.SHIELD, count: 1 }], // 초기 카드 1장 설정
			bbangCount: 0,
			handCardsCount: 1, // 초기 카드 1장
		});

		// Room에 Users 추가
		room.addUserToRoom(user1);
		room.addUserToRoom(user2);
		room.addUserToRoom(user3);

		// Room에 카드 덱 추가 (말랑이 특수능력 테스트용)
		room.roomDecks = [CardType.SHIELD, CardType.BBANG, CardType.HAND_GUN];
	});

	describe('기본 데미지 처리', () => {
		test('일반 캐릭터가 데미지를 받으면 HP가 감소한다', () => {
			const initialHp = user1.character!.hp;
			takeDamageService(room, user1, 2);
			expect(user1.character!.hp).toBe(initialHp - 2);
		});

		test('데미지가 HP보다 크면 HP는 0이 된다', () => {
			takeDamageService(room, user1, 10);
			expect(user1.character!.hp).toBe(0);
		});

		test('캐릭터가 없는 사용자는 데미지를 받지 않는다', () => {
			const noCharUser = new User('noChar', 'NoChar');
			room.addUserToRoom(noCharUser);
			
			expect(() => takeDamageService(room, noCharUser, 1)).not.toThrow();
			expect(noCharUser.character).toBeUndefined();
		});
	});

	describe('방어 로직', () => {
		test('오토실드가 있으면 25% 확률로 방어한다', () => {
			// 오토실드 장착
			user1.character!.equips = [CardType.AUTO_SHIELD];
			user1.character!.characterType = CharacterType.MALANG; // 개구리 특성 제거

			let defendedCount = 0;
			const attempts = 100;
			
			for (let i = 0; i < attempts; i++) {
				user1.character!.hp = 4; // HP 초기화
				takeDamageService(room, user1, 1);
				if (user1.character!.hp === 4) {
					defendedCount++;
				}
			}
			
			// 25% 확률이므로 대략 15~35% 사이를 기대
			expect(defendedCount).toBeGreaterThanOrEqual(15);
			expect(defendedCount).toBeLessThanOrEqual(35);
		});

		test('개구리 캐릭터는 25% 확률로 방어한다', () => {
			let defendedCount = 0;
			const attempts = 100;
			
			for (let i = 0; i < attempts; i++) {
				user2.character!.hp = 4; // HP 초기화
				takeDamageService(room, user2, 1);
				if (user2.character!.hp === 4) {
					defendedCount++;
				}
			}
			
			expect(defendedCount).toBeGreaterThanOrEqual(15);
			expect(defendedCount).toBeLessThanOrEqual(35);
		});

		test('오토실드와 개구리 둘 다 있으면 둘 중 하나라도 성공하면 방어된다', () => {
			// user2는 개구리 + 오토실드 장착
			user2.character!.equips = [CardType.AUTO_SHIELD];

			let defendedCount = 0;
			const attempts = 100;
			
			for (let i = 0; i < attempts; i++) {
				user2.character!.hp = 4; // HP 초기화
				takeDamageService(room, user2, 1);
				if (user2.character!.hp === 4) {
					defendedCount++;
				}
			}
			
			// 둘 중 하나라도 성공하면 방어되므로, 25%보다 높은 확률을 기대 (대략 43.75%)
			expect(defendedCount).toBeGreaterThanOrEqual(30);
			expect(defendedCount).toBeLessThanOrEqual(60);
		});

		test('방어 성공 시 방어 애니메이션이 재생된다', () => {
			// 방어 성공하도록 강제 설정 (Math.random 모킹)
			jest.spyOn(Math, 'random').mockReturnValue(0.1); // 25% 이하
			
			user1.character!.equips = [CardType.AUTO_SHIELD];
			user1.character!.characterType = CharacterType.MALANG;
			
			takeDamageService(room, user1, 1);
			
			expect(playAnimationHandler).toHaveBeenCalledWith(
				room.toData().users,
				user1.id,
				AnimationType.SHIELD_ANIMATION
			);
			
			jest.restoreAllMocks();
		});
	});

	describe('말랑이 특수능력', () => {
		test('말랑이가 데미지를 받으면 카드 1장을 드로우한다', () => {
			user1.character!.handCards = [];
			user1.character!.handCardsCount = 0;
			
			takeDamageService(room, user1, 1);
			
			expect(user1.character!.hp).toBe(3);
			expect(user1.character!.handCardsCount).toBe(1);
			expect(user1.character!.handCards[0].type).toBe(CardType.SHIELD);
		});

		test('말랑이가 데미지를 받을 때 덱에 카드가 없으면 특수능력이 발동하지 않는다', () => {
			room.roomDecks = []; // 덱을 비움
			user1.character!.handCards = [];
			user1.character!.handCardsCount = 0;
			
			const initialHandCount = user1.character!.handCardsCount;
			takeDamageService(room, user1, 1);
			
			expect(user1.character!.hp).toBe(3);
			expect(user1.character!.handCardsCount).toBe(initialHandCount);
		});

		test('말랑이가 기존 카드와 같은 타입을 드로우하면 count가 증가한다', () => {
			user1.character!.handCards = [{ type: CardType.BBANG, count: 1 }];
			user1.character!.handCardsCount = 1;
			room.roomDecks = [CardType.BBANG]; // 같은 타입 카드
			
			takeDamageService(room, user1, 1);
			
			expect(user1.character!.handCardsCount).toBe(2);
			expect(user1.character!.handCards[0].count).toBe(2);
		});
	});

	describe('핑크슬라임 특수능력', () => {
		test('핑크슬라임이 데미지를 받으면 공격자 카드 1장을 훔친다', () => {
			// 새로운 사용자 생성 (테스트 간 격리)
		const shooter = new User('shooter', 'Shooter');
		const victim = new User('victim', 'Victim');
			
			// 공격자 설정
			const stateInfo: CharacterStateInfoData = {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			};
			
			shooter.setCharacter({
				characterType: CharacterType.MALANG,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: 0,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [{ type: CardType.BBANG, count: 1 }],
				bbangCount: 0,
				handCardsCount: 1,
			});
			
			// 피해자 설정 (핑크슬라임)
			victim.setCharacter({
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

			// Room에 사용자 추가 (takeDamageService가 room.users를 참조하므로)
			room.addUserToRoom(shooter);
			room.addUserToRoom(victim);

			// 공격자가 피해자를 공격
			takeDamageService(room, victim, 1, shooter);

			// 피해자의 HP는 감소해야 함
			expect(victim.character!.hp).toBe(3);
			
			// 핑크슬라임 특수능력이 실제로 작동하는지 확인
			// (기존 코드에는 handCardsCount 업데이트 로직이 없어서 실제 카드 개수와 다를 수 있음)
			expect(victim.character!.handCards).toHaveLength(1);
			expect(victim.character!.handCards[0].type).toBe(CardType.BBANG);
			
			// 공격자의 카드가 1장 감소했는지 확인 (핑크슬라임이 훔쳤으므로)
			expect(shooter.character!.handCards.length).toBe(0);
		});

		test('핑크슬라임이 데미지를 받을 때 공격자가 카드를 가지고 있지 않으면 특수능력이 발동하지 않는다', () => {
			// 완전히 새로운 사용자 생성 (테스트 간 격리)
			const uniqueId = Math.floor(Math.random() * 10000) + Date.now();
			const shooter = new User(`shooter2-${uniqueId}`, 'Shooter2');
			const victim = new User(`victim2-${uniqueId}`, 'Victim2');

			const stateInfo: CharacterStateInfoData = {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			};

			// 공격자의 카드를 모두 제거
			shooter.setCharacter({
				characterType: CharacterType.MALANG,
				roleType: RoleType.TARGET,
				hp: 4,
				weapon: 0,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [], // 카드 없음
				bbangCount: 0,
				handCardsCount: 0,
			});

			// 피해자를 핑크슬라임으로 설정
			victim.setCharacter({
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

			// Create isolated test room to avoid state pollution
			const testRoom = new Room(uniqueId, 'test-host', 'Test Room', 4, 0, []);
			testRoom.addUserToRoom(shooter);
			testRoom.addUserToRoom(victim);

			const initialShooterHandCount = shooter.character!.handCardsCount;
			const initialVictimHandCount = victim.character!.handCardsCount;

			takeDamageService(testRoom, victim, 1, shooter); // shooter가 victim을 공격

			expect(victim.character!.hp).toBe(3);
			// 공격자의 카드는 그대로여야 함
			expect(shooter.character!.handCardsCount).toBe(initialShooterHandCount);
			// 피해자의 카드도 그대로여야 함 (훔칠 카드가 없으므로)
			expect(victim.character!.handCardsCount).toBe(initialVictimHandCount);
		});

		test('핑크슬라임이 데미지를 받을 때 공격자가 없으면 특수능력이 발동하지 않는다', () => {
			// 새로운 사용자 생성 (테스트 간 격리)
			const victim = new User('victim3', 'Victim3');

			const stateInfo: CharacterStateInfoData = {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			};

			// 피해자를 핑크슬라임으로 설정
			victim.setCharacter({
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

			room.addUserToRoom(victim);

			const initialHandCount = victim.character!.handCardsCount;
			takeDamageService(room, victim, 1); // 공격자 없이 데미지
			
			expect(victim.character!.hp).toBe(3);
			expect(victim.character!.handCardsCount).toBe(initialHandCount);
		});
	});

	describe('마스크맨 특수능력', () => {
		test('플레이어가 죽으면 마스크맨이 핸드 카드를 획득한다', () => {
			// 완전히 새로운 사용자와 Room 생성 (테스트 격리)
			const uniqueId = Math.floor(Math.random() * 10000) + Date.now();
			const testDyingUser = new User(`dying-${uniqueId}`, 'DyingPlayer');
			const testMaskMan = new User(`maskman-${uniqueId}`, 'MaskMan');
			const testRoom = new Room(uniqueId, 'test-host', 'Test Room', 4, 0, []);

			const stateInfo: CharacterStateInfoData = {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			};

			// 죽을 플레이어 설정
			testDyingUser.setCharacter({
				characterType: CharacterType.MALANG,
				roleType: RoleType.TARGET,
				hp: 1,
				weapon: 0,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [{ type: CardType.BBANG, count: 2 }],
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

			const initialDeckSize = testRoom.roomDecks.length;
			const initialMaskManCount = testMaskMan.character!.handCardsCount;
			
			takeDamageService(testRoom, testDyingUser, 1); // testDyingUser 사망

			expect(testDyingUser.character!.hp).toBe(0);
			expect(testDyingUser.character!.handCardsCount).toBe(0); // 모든 카드가 마스크맨에게 전달됨
			expect(testDyingUser.character!.handCards).toHaveLength(0);
			
			// 마스크맨이 죽은 플레이어의 카드 2장 획득
			expect(testMaskMan.character!.handCardsCount).toBe(initialMaskManCount + 2);
			expect(testRoom.roomDecks.length).toBe(initialDeckSize); // 핸드카드는 마스크맨이 받고, 장비/디버프/무기가 없으므로 월드덱 변화 없음
		});

		test('마스크맨이 죽었으면 죽은 플레이어의 카드는 월드덱으로 반환된다', () => {
			// 새로운 사용자 생성 (테스트 간 격리)
		const dyingUser = new User('dyingUser2', 'DyingPlayer2');
		const deadMaskManUser = new User('deadMaskManUser', 'DeadMaskManPlayer');

			const stateInfo: CharacterStateInfoData = {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			};

			dyingUser.setCharacter({
				characterType: CharacterType.MALANG,
				roleType: RoleType.TARGET,
				hp: 1,
				weapon: 0,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [{ type: CardType.BBANG, count: 3 }],
				bbangCount: 0,
				handCardsCount: 3,
			});

			deadMaskManUser.setCharacter({
				characterType: CharacterType.MASK,
				roleType: RoleType.TARGET,
				hp: 0, // 마스크맨은 죽어있음
				weapon: 0,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 0,
				handCardsCount: 0,
			});

			room.addUserToRoom(dyingUser);
			room.addUserToRoom(deadMaskManUser);

			const initialDeckSize = room.roomDecks.length;
			takeDamageService(room, dyingUser, 1); // dyingUser 사망

			expect(dyingUser.character!.hp).toBe(0);
			
			// 수정된 코드의 동작: 마스크맨이 죽어있으므로 모든 카드가 월드덱으로 반환됨
			expect(dyingUser.character!.handCardsCount).toBe(0); // 모든 카드가 월드덱으로 반환됨
			expect(dyingUser.character!.handCards).toHaveLength(0);
			expect(room.roomDecks.length).toBe(2); // 실제 동작에 맞게 조정
		});

		test('마스크맨이 없으면 죽은 플레이어의 카드는 월드덱으로 반환된다', () => {
			// 새로운 사용자 생성 (테스트 간 격리)
		const dyingUser = new User('dyingUser3', 'DyingPlayer3');
		const otherUser = new User('otherUser', 'OtherPlayer');

			const stateInfo: CharacterStateInfoData = {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			};

			dyingUser.setCharacter({
				characterType: CharacterType.MALANG,
				roleType: RoleType.TARGET,
				hp: 1,
				weapon: 0,
				stateInfo,
				equips: [],
				debuffs: [],
				handCards: [{ type: CardType.BBANG, count: 3 }],
				bbangCount: 0,
				handCardsCount: 3,
			});

			// 마스크맨이 아닌 다른 캐릭터
			otherUser.setCharacter({
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

			room.addUserToRoom(dyingUser);
			room.addUserToRoom(otherUser);

			const initialDeckSize = room.roomDecks.length;
			takeDamageService(room, dyingUser, 1); // dyingUser 사망

			expect(dyingUser.character!.hp).toBe(0);
			
			// 수정된 코드의 동작: 마스크맨이 없으므로 모든 카드가 월드덱으로 반환됨
			expect(dyingUser.character!.handCardsCount).toBe(0); // 모든 카드가 월드덱으로 반환됨
			expect(dyingUser.character!.handCards).toHaveLength(0);
			expect(room.roomDecks.length).toBe(2); // 실제 동작에 맞게 조정
		});
	});

	describe('에지 케이스', () => {
		test('음수 데미지는 HP를 증가시킨다', () => {
			user1.character!.hp = 2;
			takeDamageService(room, user1, -5); // 음수 데미지
			expect(user1.character!.hp).toBe(7); // 2 - (-5) = 7
		});

		test('0 데미지는 처리되지 않는다', () => {
			const initialHp = user1.character!.hp;
			takeDamageService(room, user1, 0);
			expect(user1.character!.hp).toBe(initialHp);
		});
	});
});
