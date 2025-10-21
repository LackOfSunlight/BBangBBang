import { CardType } from '@core/generated/common/enums';
import { ICard } from '@common/types/card';
import { AbsorbCard } from '@game/cards/card.absorb';
import { AutoRifleCard } from '@game/cards/card.auto.rifle';
import { AutoShieldCard } from '@game/cards/card.auto.shield';
import { BBangCard } from '@game/cards/card.bbang';
import { BigBBangCard } from '@game/cards/card.bibbang';
import { BombCard } from '@game/cards/card.bomb';
import { Call119Card } from '@game/cards/card.call.119';
import { ContainmentUnitCard } from '@game/cards/card.containment.unit';
import { DeathMatchCard } from '@game/cards/card.death.match';
import { DesertEagleCard } from '@game/cards/card.desert.eagle';
import { FleaMarketCard } from '@game/cards/card.flea.market';
import { GuerrillaCard } from '@game/cards/card.guerrilla';
import { HallucinationCard } from '@game/cards/card.hallucinaion';
import { HandGunCard } from '@game/cards/card.hand.gun';
import { LaserPointerCard } from '@game/cards/card.laser.pointer';
import { MaturedSavingsCard } from '@game/cards/card.matured.savings';
import { RadarCard } from '@game/cards/card.radar';
import { SatelliteTargetCard } from '@game/cards/card.satellite.target';
import { ShieldCard } from '@game/cards/card.shield';
import { SniperGunCard } from '@game/cards/card.sniper.gun';
import { StealthSuitCard } from '@game/cards/card.stealth,suit';
import { VaccineCard } from '@game/cards/card.vaccine';
import { WinLotteryCard } from '@game/cards/card.win.lottery';

const cardMap: Record<CardType, ICard | null> = {
	[CardType.NONE]: null,
	[CardType.BBANG]: new BBangCard(),
	[CardType.BIG_BBANG]: new BigBBangCard(),
	[CardType.SHIELD]: new ShieldCard(),
	[CardType.VACCINE]: new VaccineCard(),
	[CardType.CALL_119]: new Call119Card(),
	[CardType.DEATH_MATCH]: new DeathMatchCard(),
	[CardType.GUERRILLA]: new GuerrillaCard(),
	[CardType.ABSORB]: new AbsorbCard(),
	[CardType.HALLUCINATION]: new HallucinationCard(),
	[CardType.FLEA_MARKET]: new FleaMarketCard(),
	[CardType.MATURED_SAVINGS]: new MaturedSavingsCard(),
	[CardType.WIN_LOTTERY]: new WinLotteryCard(),
	[CardType.SNIPER_GUN]: new SniperGunCard(),
	[CardType.HAND_GUN]: new HandGunCard(),
	[CardType.DESERT_EAGLE]: new DesertEagleCard(),
	[CardType.AUTO_RIFLE]: new AutoRifleCard(),
	[CardType.LASER_POINTER]: new LaserPointerCard(),
	[CardType.RADAR]: new RadarCard(),
	[CardType.AUTO_SHIELD]: new AutoShieldCard(),
	[CardType.STEALTH_SUIT]: new StealthSuitCard(),
	[CardType.CONTAINMENT_UNIT]: new ContainmentUnitCard(),
	[CardType.SATELLITE_TARGET]: new SatelliteTargetCard(),
	[CardType.BOMB]: new BombCard(),
};

export default cardMap;
