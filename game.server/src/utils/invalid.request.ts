import { GameSocket } from "../type/game.socket";
import { GlobalFailCode } from "../generated/common/enums";
import { reactionResponsePacketForm, useCardResponsePacketForm } from "../converter/packet.form";
import { sendData } from "../sockets/send.data";
import { GamePacketType } from "../enums/gamePacketType";

/** 오류코드: 잘못된요청을 일괄 처리하기 위한 함수 */
export const invalidRequest = (socket: GameSocket, failcode: GlobalFailCode, gamePacketType:GamePacketType) => {
    let wrongDTO; // 초기화
    switch(gamePacketType){      
        case GamePacketType.useCardResponse:
            wrongDTO = useCardResponsePacketForm(false, failcode);
            break;
        case GamePacketType.reactionResponse:
            wrongDTO = reactionResponsePacketForm(false, failcode);
            break;
        default:
            return;
    }
    
    if(wrongDTO)
        sendData(socket, wrongDTO, gamePacketType);
};
