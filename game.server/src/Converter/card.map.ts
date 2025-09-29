import { CardType } from '../Generated/common/enums';
import { ICard } from '../Type/card';
import { AbsorbCard } from '../Cards/Class/card.absorb';
import { AutoRifleCard } from '../Cards/Class/card.auto.rifle';
import { AutoShieldCard } from '../Cards/Class/card.auto.shield';
import { BBangCard } from '../Cards/Class/card.bbang';
import { BigBBangCard } from '../Cards/Class/card.bibbang';
import { BombCard } from '../Cards/Class/card.bomb';
import { Call119Card } from '../Cards/Class/card.call.119';
import { ContainmentUnitCard } from '../Cards/Class/card.containment.unit';
import { DeathMatchCard } from '../Cards/Class/card.death.match';
import { DesertEagleCard } from '../Cards/Class/card.desert.eagle';
import { FleaMarketCard } from '../Cards/Class/card.flea.market';
import { GuerrillaCard } from '../Cards/Class/card.guerrilla';
import { HallucinationCard } from '../Cards/Class/card.hallucinaion';
import { HandGunCard } from '../Cards/Class/card.hand.gun';
import { LaserPointerCard } from '../Cards/Class/card.laser.pointer';
import { MaturedSavingsCard } from '../Cards/Class/card.matured.savings';
import { RadarCard } from '../Cards/Class/card.radar';
import { SatelliteTargetCard } from '../Cards/Class/card.satellite.target';
import { ShieldCard } from '../Cards/Class/card.shield';
import { SniperGunCard } from '../Cards/Class/card.sniper.gun';
import { StealthSuitCard } from '../Cards/Class/card.stealth,suit';
import { VaccineCard } from '../Cards/Class/card.vaccine';
import { WinLotteryCard } from '../Cards/Class/card.win.lottery';

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
