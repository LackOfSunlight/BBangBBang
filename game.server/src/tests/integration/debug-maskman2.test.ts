import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { RoomStateType, CharacterType, RoleType, CharacterStateType, CardType } from '../../generated/common/enums';
import { CharacterStateInfoData } from '../../generated/common/types';
import takeDamageService from '../../services/take.damage.service';

describe('Debug MaskMan Test 2', () => {
	let room: Room;
	let dyingUser: User;
	let maskManUser: User;

	beforeEach(() => {
		room = new Room(1, 'owner', 'Test Room', 4, RoomStateType.WAIT, []);
		
		const stateInfo: CharacterStateInfoData = {
			state: CharacterStateType.NONE_CHARACTER_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
			stateTargetUserId: '0',
		};

	dyingUser = new User('dying', 'DyingPlayer');
	dyingUser.setCharacter({
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

	maskManUser = new User('maskman', 'MaskManPlayer');
	maskManUser.setCharacter({
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

		room.addUserToRoom(dyingUser);
		room.addUserToRoom(maskManUser);
	});

	test('마스크맨이 살아있을 때 죽은 플레이어 카드 처리 - 상세 로그', () => {
		console.log('=== Before ===');
		console.log('DyingUser HP:', dyingUser.character!.hp);
		console.log('DyingUser handCards:', JSON.stringify(dyingUser.character!.handCards));
		console.log('DyingUser handCardsCount:', dyingUser.character!.handCardsCount);
		console.log('MaskMan HP:', maskManUser.character!.hp);
		console.log('MaskMan handCards:', JSON.stringify(maskManUser.character!.handCards));
		console.log('MaskMan handCardsCount:', maskManUser.character!.handCardsCount);
		console.log('Room deck size:', room.roomDecks.length);
		console.log('Room deck:', JSON.stringify(room.roomDecks));
		
		// 마스크맨 확인
		const maskMan = room.users.find((u) => u.character?.characterType === CharacterType.MASK);
		console.log('Found maskMan:', maskMan ? maskMan.nickname : 'null');
		console.log('maskMan alive:', maskMan && maskMan.character!.hp > 0);

		takeDamageService(room, dyingUser, 1);

		console.log('=== After ===');
		console.log('DyingUser HP:', dyingUser.character!.hp);
		console.log('DyingUser handCards:', JSON.stringify(dyingUser.character!.handCards));
		console.log('DyingUser handCardsCount:', dyingUser.character!.handCardsCount);
		console.log('MaskMan HP:', maskManUser.character!.hp);
		console.log('MaskMan handCards:', JSON.stringify(maskManUser.character!.handCards));
		console.log('MaskMan handCardsCount:', maskManUser.character!.handCardsCount);
		console.log('Room deck size:', room.roomDecks.length);
		console.log('Room deck:', JSON.stringify(room.roomDecks));

		// 실제 결과 확인
		expect(dyingUser.character!.hp).toBe(0);
		expect(dyingUser.character!.handCardsCount).toBe(0);
		expect(maskManUser.character!.handCardsCount).toBe(2);
		expect(room.roomDecks.length).toBe(0); // 월드덱에는 변화 없음
	});
});
