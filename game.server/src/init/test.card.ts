import { CardType } from "../generated/common/enums";
import { CardData } from "../generated/common/types";


export const testCard:CardData[] = [
    {
        type: CardType.DEATH_MATCH,
        count:4,
    },
    {
        type: CardType.MATURED_SAVINGS,
        count: 4,
    },
    {
        type: CardType.BBANG,
        count: 4
    }
];