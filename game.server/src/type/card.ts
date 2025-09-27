import { CardType } from '../generated/common/enums';

export interface Card {
	type: CardType;
	isUsable: boolean;
	defCard: CardType;
	isDirectUse: boolean;
	isTargetSelect: boolean;
	isTargetCardSelection: boolean;
	useTag: string;
}
