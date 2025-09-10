import { CharacterType, RoleType } from "../generated/common/enums";
import { CardData, CharacterData, CharacterStateInfoData} from "../generated/common/types";

export class Character implements CharacterData{
    characterType: CharacterType;
    roleType: RoleType;
    hp: number;
    weapon: number;

    stateInfo?: CharacterStateInfoData | undefined;

    equips: number[];
    debuffs: number[];
    handCards: CardData[];
    bbangCount: number;
    handCardsCount: number;

    constructor(
        characterType: CharacterType, 
        roleType: RoleType,
        hp: number,
        weapon: number,

        equips: number[],
        debuffs: number[],
        handCards: CardData[],
        bbangCount: number,
        handCardsCount: number
    ){
        this.characterType = characterType;
        this.roleType = roleType;
        this.hp = hp;
        this.weapon = weapon;

        this.equips = equips;
        this.debuffs = debuffs;
        this.bbangCount = bbangCount;
        this.handCards = handCards;
        this.handCardsCount = handCardsCount;
        
    }
}