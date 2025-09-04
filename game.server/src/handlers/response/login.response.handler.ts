import { Socket } from "net";
import { S2CLoginResponse } from "../../generated/packet/auth.js";
import { GamePacket } from "../../generated/gamePacket.js";

const loginResponseHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  loginResponseHandler;
