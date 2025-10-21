import { CardCategory } from '@game/enums/card.category';
import { CardType } from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';

export interface ICard {
	type: CardType;
	cardCategory: CardCategory;

	useCard(room: Room, user: User, target?: User): boolean;
}

export interface IPeriodicEffectCard {
	onNewDay(room: Room): Promise<Room>;
}
