import cardData from '../data/card.data.json';
import { CardData, RoomData } from '../generated/common/types';
import { CardType, RoomStateType } from '../generated/common/enums';
import { CharacterData } from '../generated/common/types';
import { User } from './user.model';
import { shuffle } from '../utils/shuffle.util';

const cardDefinitions: CardData[] = (cardData as any[]).map((card) => {
	const cardType = CardType[card.type as keyof typeof CardType];
	
	// undefined 체크 및 유효한 카드 타입만 허용
	if (cardType === undefined || cardType === CardType.NONE || cardType < 1 || cardType > 23) {
		console.error(`[initializeDeck] 잘못된 카드 타입: ${card.type}, 변환된 값: ${cardType}`);
		return null;
	}
	
	return {
		...card,
		type: cardType,
	};
}).filter((card): card is CardData => card !== null);

export class Room {
	id: number;
	ownerId: string;
	name: string;
	maxUserNum: number;
	state: RoomStateType;
	users: User[];

	roomDecks: CardType[] = [];
	roomFleaMarketCards: CardType[] = [];
	fleaMarketPickIndex: number[] = [];

	constructor(
		id: number,
		ownerId: string,
		name: string,
		maxUserNum: number,
		state: RoomStateType,
		users: User[],
	) {
		this.id = id;
		this.ownerId = ownerId;
		this.name = name;
		this.maxUserNum = maxUserNum;
		this.state = state;
		this.users = users;
	}

	// 유저를 방에 추가
	public addUserToRoom(user: User) {
		if (this.users.length >= this.maxUserNum) {
			return;
		}

		this.users.push(user);
	}

	// 유저를 방에서 제거
	public removeUserFromRoom(userId: string): void {
		this.users = this.users.filter((u) => u.id !== userId);
	}

	// 방에서 특정 유저 가져오기
	public getUserFromRoom(userId: string): User {
		// 유저 찾기
		const user = this.users.find((u) => u.id === userId);
		if (!user) throw new Error('User not found');
		return user;
	}

	/* 방에서 특정 유저 정보 업데이트
		사용 예시
		const updated = await updateUserFromRoom(1, 1001, {character: charaterData });
		  if (updated) {
			console.log("업데이트된 유저:", updated);
		  } else {
		  console.log("유저를 찾을 수 없음");
		  }
		*/
	public updateCharacterFromRoom(
		userId: string,
		updateData: Partial<CharacterData>, // 업데이트할 필드만 넘길 수 있도록 Partial<User>
	): void {
		// 유저 찾기
		const userIndex = this.users.findIndex((u) => u.id === userId);
		if (userIndex === -1) throw new Error('User not found');

		const user = this.users[userIndex];

		if (user.character) {
			Object.assign(user.character, updateData);
		}

		// // 기존 유저 데이터
		// const user = this.users[userIndex];

		// // 업데이트 (얕은 병합)
		// const updatedUser = {
		// 	...user,
		// 	character: { ...user.character, ...updateData } as CharacterData,
		// };

		// // 배열에 반영
		// this.users[userIndex].setUserData(updatedUser.id, updatedUser.nickname, updatedUser.character);
	}

	// 방에서 특정 유저의 정보(아이디 제외한 속성값들) 배열로 가져오기
	public getUserInfoFromRoom(socketId: string): any[] {
		// socket.id와 일치하는 유저 찾기
		const user = this.users.find((u) => u.id === socketId);
		if (!user) return [];

		// 속성값을 배열로 추출
		const userValues = Object.entries(user)
			//.filter(([key]) => key !== 'id') // id 제외
			.map(([_, value]) => value); // 값만 배열로 저장

		return userValues;
	}

	////////////////////////////////////////////////////////////////////

	// 방에 카드덱 초기화
	public initializeDeck(): void {
		const deck: CardType[] = [];
		cardDefinitions.forEach((cardDef) => {
			// Add 'count' number of cards of 'type' to the deck
			for (let i = 0; i < cardDef.count; i++) {
				deck.push(cardDef.type);
			}
		});

		this.roomDecks = shuffle<CardType>(deck);
	}

	public drawDeck(count: number = 1): CardType[] {
		if (this.roomDecks) {
			if (count > this.roomDecks.length) {
				count = this.roomDecks.length;
			}
			return this.roomDecks.splice(0, count);
		} else {
			return [];
		}
	}

	public repeatDeck(cards: CardType[]): void {
		if (this.roomDecks) this.roomDecks.push(...cards);
	}

	// 죽은 플레이어의 모든 카드를 월드덱으로 이동
	public returnDeadPlayerCardsToDeck(user: User): void {
		if (!user.character || user.character.hp > 0) return;

		const cardsToReturn: CardType[] = [];

		// 핸드 카드들 월드덱으로 이동
		user.character.handCards.forEach((card) => {
			for (let i = 0; i < card.count; i++) {
				cardsToReturn.push(card.type);
			}
		});
		user.character.handCards = [];
		user.character.handCardsCount = 0;

		// 장비 카드들 월드덱으로 이동
		user.character.equips.forEach((cardType) => {
			cardsToReturn.push(cardType);
		});
		user.character.equips = [];

		// 디버프 카드들 월드덱으로 이동
		user.character.debuffs.forEach((cardType) => {
			cardsToReturn.push(cardType);
		});
		user.character.debuffs = [];

		// 무기 카드 월드덱으로 이동
		if (user.character.weapon !== CardType.NONE) {
			cardsToReturn.push(user.character.weapon);
			user.character.weapon = CardType.NONE;
		}

		// 모든 카드를 월드덱에 추가
		this.repeatDeck(cardsToReturn);

		console.log(`[죽은 플레이어 카드 정리] ${user.nickname}: ${cardsToReturn.length}장의 카드를 월드덱으로 반환`);
	}

	public getDeckSize(): number {
		if (this.roomDecks) return this.roomDecks.length;
		else return 0;
	}

	public drawSpecificCard(cardType: CardType): CardType | null {
		if (!this.roomDecks) return CardType.NONE;

		// 카드 위치 찾기
		const index = this.roomDecks.findIndex((c) => c === cardType);
		if (index === -1) return null;

		// 해당 카드를 덱에서 제거 후 반환
		return this.roomDecks.splice(index, 1)[0];
	}

	public removeCard(user: User, cardType: CardType) {
		if (!user.character) return;

		user.character.removeHandCard(cardType);

		this.repeatDeck([cardType]);
	}

	public toData(): RoomData {
		return {
			id: this.id,
			ownerId: this.ownerId,
			name: this.name,
			maxUserNum: this.maxUserNum,
			state: this.state,
			users: this.users.map((u) => u.toData()),
		};
	}
}
