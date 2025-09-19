import { CardType } from '../generated/common/enums';
import { CardData } from '../generated/common/types';

export const testCard: CardData[] = [
	{
		type: CardType.BBANG,
		count: 4,
	},
	{
		type: CardType.BIG_BBANG,
		count: 2,
	},
	{
		type: CardType.SHIELD,
		count: 2,
	},
	{
		type: CardType.DESERT_EAGLE,
		count: 2,
	},
	{
		type: CardType.STEALTH_SUIT,
		count: 2,
	},
	{
		type: CardType.RADAR,
		count: 2,
	},
];
