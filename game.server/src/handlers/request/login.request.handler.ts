import { Socket } from "net";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from "../../utils/type.converter.js";
import { GamePacketType, gamePackType } from "../../enums/gamePacketType.js";
import loginResponseHandler from "../response/login.response.handler.js";


const loginRequestHandler = (socket:Socket, gamePacket:GamePacket) =>{

    const payload = getGamePacketType(gamePacket, gamePackType.loginRequest);

    if(payload){
        console.log(`로그인 이메일:${payload.loginRequest.email}`);

        loginResponseHandler(socket, gamePacket);
    }


}


export default  loginRequestHandler;