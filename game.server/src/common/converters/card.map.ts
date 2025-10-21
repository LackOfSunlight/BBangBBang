import { CardType } from '@core/generated/common/enums';
import { ICard } from '@common/types/card';
import { Card } from '@game/models/card.model';

const cardMap: Record<CardType, ICard | null> = {
	[CardType.NONE]: null,
	[CardType.BBANG]: Card.createCard(CardType.BBANG),
	[CardType.BIG_BBANG]: Card.createCard(CardType.BIG_BBANG),
	[CardType.SHIELD]: Card.createCard(CardType.SHIELD),
	[CardType.VACCINE]: Card.createCard(CardType.VACCINE),
	[CardType.CALL_119]: Card.createCard(CardType.CALL_119),
	[CardType.DEATH_MATCH]: Card.createCard(CardType.DEATH_MATCH),
	[CardType.GUERRILLA]: Card.createCard(CardType.GUERRILLA),
	[CardType.ABSORB]: Card.createCard(CardType.ABSORB),
	[CardType.HALLUCINATION]: Card.createCard(CardType.HALLUCINATION),
	[CardType.FLEA_MARKET]: Card.createCard(CardType.FLEA_MARKET),
	[CardType.MATURED_SAVINGS]: Card.createCard(CardType.MATURED_SAVINGS),
	[CardType.WIN_LOTTERY]: Card.createCard(CardType.WIN_LOTTERY),
	[CardType.SNIPER_GUN]: Card.createCard(CardType.SNIPER_GUN),
	[CardType.HAND_GUN]: Card.createCard(CardType.HAND_GUN),
	[CardType.DESERT_EAGLE]: Card.createCard(CardType.DESERT_EAGLE),
	[CardType.AUTO_RIFLE]: Card.createCard(CardType.AUTO_RIFLE),
	[CardType.LASER_POINTER]: Card.createCard(CardType.LASER_POINTER),
	[CardType.RADAR]: Card.createCard(CardType.RADAR),
	[CardType.AUTO_SHIELD]: Card.createCard(CardType.AUTO_SHIELD),
	[CardType.STEALTH_SUIT]: Card.createCard(CardType.STEALTH_SUIT),
	[CardType.CONTAINMENT_UNIT]: Card.createCard(CardType.CONTAINMENT_UNIT),
	[CardType.SATELLITE_TARGET]: Card.createCard(CardType.SATELLITE_TARGET),
	[CardType.BOMB]: Card.createCard(CardType.BOMB),
};

export default cardMap;
