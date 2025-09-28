import { CardType } from '../generated/common/enums';
import { ICard } from '../type/card';
import { AbsorbCard } from '../card/class/card.absorb';
import { AutoRifleCard } from '../card/class/card.auto.rifle';
import { AutoShieldCard } from '../card/class/card.auto.shield';
import { BBangCard } from '../card/class/card.bbang';
import { BigBBangCard } from '../card/class/card.bibbang';
import { BombCard } from '../card/class/card.bomb';
import { Call119Card } from '../card/class/card.call.119';
import { ContainmentUnitCard } from '../card/class/card.containment.unit';
import { DeathMatchCard } from '../card/class/card.death.match';
import { DesertEagleCard } from '../card/class/card.desert.eagle';
import { FleaMarketCard } from '../card/class/card.flea.market';
import { GuerrillaCard } from '../card/class/card.guerrilla';
import { HallucinationCard } from '../card/class/card.hallucinaion';
import { HandGunCard } from '../card/class/card.hand.gun';
import { LaserPointerCard } from '../card/class/card.laser.pointer';
import { MaturedSavingsCard } from '../card/class/card.matured.savings';
import { RadarCard } from '../card/class/card.radar';
import { SatelliteTargetCard } from '../card/class/card.satellite.target';
import { ShieldCard } from '../card/class/card.shield';
import { SniperGunCard } from '../card/class/card.sniper.gun';
import { StealthSuitCard } from '../card/class/card.stealth,suit';
import { VaccineCard } from '../card/class/card.vaccine';
import { WinLotteryCard } from '../card/class/card.win.lottery';

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
