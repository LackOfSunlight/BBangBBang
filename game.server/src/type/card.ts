import { CardCategory } from '../enums/card.category';
import { CardType } from '../generated/common/enums';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';

export interface ICard {
	type: CardType;
	cardCategory: CardCategory;
}

export interface IActiveTargetCard extends ICard {
	useCard(room: Room, user: User, target: User): boolean;
}

export interface IActiveNonTargetCard extends ICard {
	useCard(room: Room, user: User): boolean;
}

export interface IEquipCard extends ICard {
	useCard(room: Room, user: User): boolean;
}

export interface IBuffCard extends ICard {
	useCard(room: Room, user: User): boolean;
}

export interface IDebuffCard extends ICard {
	useCard(room: Room, user: User, target: User): boolean;
}
