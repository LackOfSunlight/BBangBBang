import { CardType } from "../generated/common/enums";
import { CardData } from "../generated/common/types";


export const testCard:CardData[] = [
    {
        type: CardType.LASER_POINTER,
        count:1,
    },
    {
        type: CardType.BBANG,
        count: 3,
    },
    {
        type: CardType.SHIELD,
        count:4
    }
];