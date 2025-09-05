import { sendData } from '../../utils/sendData';
import { GamePacketType } from "../../enums/gamePacketType.js";
import { GlobalFailCode } from "../../generated/common/enums.js";
const loginResponseHandler = (socket, gamePacket) => {
    const newGamePacket = {
        payload: {
            oneofKind: GamePacketType.loginResponse,
            loginResponse: {
                success: true,
                message: `로그인 성공`,
                token: `토큰`,
                myInfo: undefined,
                failCode: GlobalFailCode.NONE_FAILCODE
            },
        },
    };
    sendData(socket, newGamePacket, GamePacketType.loginResponse);
};
export default loginResponseHandler;
