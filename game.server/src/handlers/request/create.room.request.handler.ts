import { Socket } from "net";
import { C2SCreateRoomRequest } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from "../../utils/type.converter.js";
import { gamePackTypeSelect } from "../../enums/gamePacketType.js";
import { RoomData } from "../../generated/common/types.js";
import { RoomStateType } from "../../generated/common/enums.js";
import { GameSocket } from "../../utils/game.socket.js";

const createRoomRequestHandler = (socket:GameSocket, gamePacket:GamePacket) =>{
    const payload = getGamePacketType(gamePacket, gamePackTypeSelect.createRoomRequest);

    if(payload){

        const roomData:RoomData ={
            id: 0,
            ownerId: "누가 만듬?",
            name: payload.createRoomRequest.name,
            maxUserNum: payload.createRoomRequest.maxUserNum,
            state: RoomStateType.WAIT,
            users: [],
        }
    }

}

export default createRoomRequestHandler