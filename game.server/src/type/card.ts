import { CardCategory } from '../enums/card.category';
import { CardType } from '../generated/common/enums';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';

export interface ICard {
	type: CardType;
	cardCategory: CardCategory;

	useCard(room: Room, user: User, target?: User): boolean;
}

export interface IPeriodicEffectCard {
	onNewDay(room: Room): Promise<Room>;
}
