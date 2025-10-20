import cardData from '../../../data/card.data.json';
import { CardData, RoomData } from '../../../generated/common/types';
import { CardType, RoomStateType } from '../../../generated/common/enums';
import { CharacterData } from '../../../generated/common/types';
import { User } from '../../../models/user.model';
import { shuffle } from '../../../utils/shuffle.util';

/**
 * Room 도메인 엔티티
 * 게임 방의 핵심 비즈니스 로직을 담당합니다.
 */
export class Room {
	private readonly _id: number;
	private readonly _ownerId: string;
	private _name: string;
	private readonly _maxUserNum: number;
	private _state: RoomStateType;
	private _users: User[];

	// 카드 관련 속성들
	private _roomDecks: CardType[] = [];
	private _roomFleaMarketCards: CardType[] = [];
	private _fleaMarketPickIndex: number[] = [];

	constructor(
		id: number,
		ownerId: string,
		name: string,
		maxUserNum: number,
		state: RoomStateType = 0,
		users: User[] = []
	) {
		this._id = id;
		this._ownerId = ownerId;
		this._name = name;
		this._maxUserNum = maxUserNum;
		this._state = state;
		this._users = users;
	}

	// Getters
	get id(): number { return this._id; }
	get ownerId(): string { return this._ownerId; }
	get name(): string { return this._name; }
	get maxUserNum(): number { return this._maxUserNum; }
	get state(): RoomStateType { return this._state; }
	get users(): readonly User[] { return [...this._users]; }
	get roomDecks(): readonly CardType[] { return [...this._roomDecks]; }
	get roomFleaMarketCards(): readonly CardType[] { return [...this._roomFleaMarketCards]; }
	get fleaMarketPickIndex(): readonly number[] { return [...this._fleaMarketPickIndex]; }

	// 방 상태 관리
	public setName(name: string): void {
		this._name = name;
	}

	public setState(state: RoomStateType): void {
		this._state = state;
	}

	// 유저 관리
	public addUser(user: User): boolean {
		if (this._users.length >= this._maxUserNum) {
			console.log(`[Room ${this._id}] 방이 가득 찼습니다. (${this._users.length}/${this._maxUserNum})`);
			return false;
		}

		if (this._users.find(u => u.id === user.id)) {
			console.log(`[Room ${this._id}] 이미 존재하는 유저입니다: ${user.id}`);
			return false;
		}

		this._users.push(user);
		console.log(`[Room ${this._id}] 유저 추가: ${user.nickname} (${this._users.length}/${this._maxUserNum})`);
		return true;
	}

	public removeUser(userId: string): boolean {
		const initialLength = this._users.length;
		this._users = this._users.filter(u => u.id !== userId);
		
		if (this._users.length < initialLength) {
			console.log(`[Room ${this._id}] 유저 제거: ${userId}`);
			return true;
		}
		
		console.log(`[Room ${this._id}] 유저를 찾을 수 없습니다: ${userId}`);
		return false;
	}

	public getUser(userId: string): User | null {
		return this._users.find(u => u.id === userId) || null;
	}

	public updateCharacter(userId: string, updateData: Partial<CharacterData>): boolean {
		const user = this.getUser(userId);
		if (!user || !user.character) {
			return false;
		}

		Object.assign(user.character, updateData);
		return true;
	}

	// 카드 덱 관리
	public initializeDeck(): void {
		const deck: CardType[] = [];
		const cardDefinitions: CardData[] = (cardData as any[]).map((card) => ({
			...card,
			type: CardType[card.type as keyof typeof CardType],
		}));

		cardDefinitions.forEach((cardDef) => {
			for (let i = 0; i < cardDef.count; i++) {
				deck.push(cardDef.type);
			}
		});

		this._roomDecks = shuffle<CardType>(deck);
		console.log(`[Room ${this._id}] 덱 초기화 완료: ${this._roomDecks.length}장`);
	}

	public drawCards(count: number = 1): CardType[] {
		if (count > this._roomDecks.length) {
			count = this._roomDecks.length;
		}
		
		const drawnCards = this._roomDecks.splice(0, count);
		console.log(`[Room ${this._id}] 카드 ${drawnCards.length}장 뽑기 (남은 카드: ${this._roomDecks.length}장)`);
		return drawnCards;
	}

	// 기존 Room과의 호환성을 위한 별칭 메서드
	public drawDeck(count: number = 1): CardType[] {
		return this.drawCards(count);
	}

	public returnCards(cards: CardType[]): void {
		this._roomDecks.push(...cards);
		console.log(`[Room ${this._id}] 카드 ${cards.length}장 반환 (총 카드: ${this._roomDecks.length}장)`);
	}

	public getDeckSize(): number {
		return this._roomDecks.length;
	}

	public drawSpecificCard(cardType: CardType): CardType | null {
		const index = this._roomDecks.findIndex(c => c === cardType);
		if (index === -1) return null;

		const card = this._roomDecks.splice(index, 1)[0];
		console.log(`[Room ${this._id}] 특정 카드 뽑기: ${cardType} (남은 카드: ${this._roomDecks.length}장)`);
		return card;
	}

	// 플레이어 카드 정리
	public returnDeadPlayerCards(user: User): void {
		if (!user.character || user.character.hp > 0) {
			console.log(`[Room ${this._id}] 생존한 플레이어의 카드는 정리하지 않습니다: ${user.nickname}`);
			return;
		}

		const cardsToReturn: CardType[] = [];

		// 핸드 카드들
		user.character.handCards.forEach((card) => {
			for (let i = 0; i < card.count; i++) {
				cardsToReturn.push(card.type);
			}
		});
		user.character.handCards = [];
		user.character.handCardsCount = 0;

		// 장비 카드들
		user.character.equips.forEach((cardType) => {
			cardsToReturn.push(cardType);
		});
		user.character.equips = [];

		// 디버프 카드들
		user.character.debuffs.forEach((cardType) => {
			cardsToReturn.push(cardType);
		});
		user.character.debuffs = [];

		// 무기 카드
		if (user.character.weapon !== CardType.NONE) {
			cardsToReturn.push(user.character.weapon);
			user.character.weapon = CardType.NONE;
		}

		// 모든 카드를 덱에 반환
		this.returnCards(cardsToReturn);
		console.log(`[Room ${this._id}] 죽은 플레이어 카드 정리 완료: ${user.nickname} (${cardsToReturn.length}장)`);
	}

	// 기존 Room과의 호환성을 위한 별칭 메서드
	public returnDeadPlayerCardsToDeck(user: User): void {
		this.returnDeadPlayerCards(user);
	}

	// 플리마켓 관리
	public initializeFleaMarket(): void {
		// TODO: 플리마켓 초기화 로직 구현
		console.log(`[Room ${this._id}] 플리마켓 초기화`);
	}

	// 방 정보 반환
	public toData(): RoomData {
		return {
			id: this._id,
			ownerId: this._ownerId,
			name: this._name,
			maxUserNum: this._maxUserNum,
			state: this._state,
			users: this._users.map(u => u.toData()),
		};
	}

	// 방 상태 검증
	public isValid(): boolean {
		return this._id > 0 && 
			   this._ownerId.length > 0 && 
			   this._name.length > 0 && 
			   this._maxUserNum > 0;
	}

	public isFull(): boolean {
		return this._users.length >= this._maxUserNum;
	}

	public isEmpty(): boolean {
		return this._users.length === 0;
	}

	public canStartGame(): boolean {
		return this._users.length >= 2 && this._state === 0;
	}
}

export default Room;
