import { CardCategory } from '../Enums/card.category';
import { CardType } from '../Generated/common/enums';
import { Room } from '../Models/room.model';
import { User } from '../Models/user.model';

export interface ICard {
	type: CardType;
	cardCategory: CardCategory;

	useCard(room: Room, user: User, target?: User): boolean;
}

export interface IPeriodicEffectCard {
	onNewDay(room: Room): Promise<Room>;
}
