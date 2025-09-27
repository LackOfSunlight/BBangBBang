import { CardType } from '../../generated/common/enums';
import { ICard } from '../../type/card';
import { AbsorbCard } from './card.absorb';
import { AutoRifleCard } from './card.auto.rifle';
import { AutoShieldCard } from './card.auto.shield';
import { BBangCard } from './card.bbang';
import { BigBBangCard } from './card.bibbang';
import { BombCard } from './card.bomb';
import { Call119Card } from './card.call.119';
import { ContainmentUnitCard } from './card.containment.unit';
import { DeathMatchCard } from './card.death.match';
import { DesertEagleCard } from './card.desert.eagle';
import { FleaMarketCard } from './card.flea.market';
import { GuerrillaCard } from './card.guerrilla';
import { HallucinationCard } from './card.hallucinaion';
import { HandGunCard } from './card.hand.gun';
import { LaserPointerCard } from './card.laser.pointer';
import { MaturedSavingsCard } from './card.matured.savings';
import { RadarCard } from './card.radar';
import { SatelliteTargetCard } from './card.satellite.target';
import { ShieldCard } from './card.shield';
import { SniperGunCard } from './card.sniper.gun';
import { StealthSuitCard } from './card.stealth,suit';
import { VaccineCard } from './card.vaccine';
import { WinLotteryCard } from './card.win.lottery';

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
