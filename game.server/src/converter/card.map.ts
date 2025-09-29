import { CardType } from '../Generated/common/enums';
import { ICard } from '../Type/card';
import { AbsorbCard } from '../Cards/Active/card.absorb';
import { AutoRifleCard } from '../Cards/Weapon/card.auto.rifle';
import { AutoShieldCard } from '../Cards/Equip/card.auto.shield';
import { BBangCard } from '../Cards/Active/card.bbang';
import { BigBBangCard } from '../Cards/Active/card.bibbang';
import { BombCard } from '../Cards/Debuff/card.bomb';
import { Call119Card } from '../Cards/Active/card.call.119';
import { ContainmentUnitCard } from '../Cards/Debuff/card.containment.unit';
import { DeathMatchCard } from '../Cards/Active/card.death.match';
import { DesertEagleCard } from '../Cards/Weapon/card.desert.eagle';
import { FleaMarketCard } from '../Cards/Active/card.flea.market';
import { GuerrillaCard } from '../Cards/Active/card.guerrilla';
import { HallucinationCard } from '../Cards/Active/card.hallucinaion';
import { HandGunCard } from '../Cards/Weapon/card.hand.gun';
import { LaserPointerCard } from '../Cards/Equip/card.laser.pointer';
import { MaturedSavingsCard } from '../Cards/Active/card.matured.savings';
import { RadarCard } from '../Cards/Equip/card.radar';
import { SatelliteTargetCard } from '../Cards/Debuff/card.satellite.target';
import { ShieldCard } from '../Cards/Active/card.shield';
import { SniperGunCard } from '../Cards/Weapon/card.sniper.gun';
import { StealthSuitCard } from '../Cards/Equip/card.stealth,suit';
import { VaccineCard } from '../Cards/Active/card.vaccine';
import { WinLotteryCard } from '../Cards/Active/card.win.lottery';

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
