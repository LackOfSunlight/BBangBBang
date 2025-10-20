import { CharacterType, RoleType, CardType } from '../../generated/common/enums';
import { CharacterStateInfoData } from '../../generated/common/types';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { CardFactory } from '../../domains/game/cards/CardFactory';
import { HandGunCard } from '../../domains/game/cards/weapons/HandGunCard';

describe('Card OOP Integration Tests', () => {
	let room: Room;
	let user1: User;
	let user2: User;

	beforeEach(() => {
		// Room 초기화
		room = new Room(1, 'test-host', 'Test Room', 4, 0, []);
		room.roomDecks = [];

		// 공통 상태 정보
		const stateInfo: CharacterStateInfoData = {
			state: 0,
			nextState: 0,
			nextStateAt: '0',
			stateTargetUserId: '0'
		};

  	// User1: 기본 캐릭터
  	user1 = new User('user1', 'Player1');
  	user1.setCharacter({
  		characterType: CharacterType.RED,
  		roleType: RoleType.TARGET,
			hp: 4,
			weapon: CardType.NONE,
			stateInfo,
			equips: [],
			debuffs: [],
			handCards: [{ type: CardType.HAND_GUN, count: 1 }],
			bbangCount: 0,
			handCardsCount: 1,
		});

  	// User2: 공격 대상
  	user2 = new User('user2', 'Player2');
  	user2.setCharacter({
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
		room.addUserToRoom(user1);
		room.addUserToRoom(user2);
	});

	describe('CardFactory', () => {
		test('HandGun 카드를 생성할 수 있다', () => {
			const card = CardFactory.createCard(CardType.HAND_GUN);
			
			expect(card).toBeInstanceOf(HandGunCard);
			expect(card.getCardType()).toBe(CardType.HAND_GUN);
		});

		test('지원하지 않는 카드 타입에 대해 에러를 발생시킨다', () => {
			expect(() => {
				CardFactory.createCard(CardType.SHIELD);
			}).toThrow('지원하지 않는 카드 타입입니다');
		});

		test('같은 카드 타입에 대해 같은 인스턴스를 반환한다', () => {
			const card1 = CardFactory.createCard(CardType.HAND_GUN);
			const card2 = CardFactory.createCard(CardType.HAND_GUN);
			
			expect(card1).toBe(card2);
		});

		test('지원되는 카드 타입을 확인할 수 있다', () => {
			expect(CardFactory.isSupported(CardType.HAND_GUN)).toBe(true);
			expect(CardFactory.isSupported(CardType.SHIELD)).toBe(false);
		});
	});

	describe('HandGunCard', () => {
		test('HandGun 카드를 사용하면 무기가 장착된다', () => {
			const card = CardFactory.createCard(CardType.HAND_GUN);
			const initialWeapon = user1.character!.weapon;
			
			expect(initialWeapon).toBe(CardType.NONE);
			
			const result = card.useCard(user1, room);
			
			expect(result).toBe(true);
			expect(user1.character!.weapon).toBe(CardType.HAND_GUN);
		});

		test('이미 HandGun을 장착한 상태에서는 사용할 수 없다', () => {
			const card = CardFactory.createCard(CardType.HAND_GUN);
			
			// 먼저 HandGun 장착
			user1.character!.weapon = CardType.HAND_GUN;
			
			const result = card.useCard(user1, room);
			
			expect(result).toBe(false);
		});

		test('기존 무기가 있으면 덱으로 반환된다', () => {
			const card = CardFactory.createCard(CardType.HAND_GUN);
			const initialDeckSize = room.roomDecks.length;
			
			// 기존 무기 설정
			user1.character!.weapon = CardType.SHIELD;
			
			const result = card.useCard(user1, room);
			
			expect(result).toBe(true);
			expect(user1.character!.weapon).toBe(CardType.HAND_GUN);
			expect(room.roomDecks.length).toBe(initialDeckSize + 1);
			expect(room.roomDecks).toContain(CardType.SHIELD);
		});

		test('카드 설명을 반환할 수 있다', () => {
			const card = CardFactory.createCard(CardType.HAND_GUN);
			const description = card.getDescription();
			
			expect(description).toContain('데미지 1');
			expect(description).toContain('권총');
		});
	});
});
