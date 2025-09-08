import { GameSocket } from "../../type/game.socket.js";
import { C2SLeaveRoomRequest } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from "../../utils/type.converter.js";
import { gamePackTypeSelect } from "../../enums/gamePacketType.js";
import { prisma } from "../../utils/db.js";
import { getUserFromRoom } from "../../utils/redis.util.js";


const leaveRoomRequestHandler = async(socket:GameSocket, gamePacket:GamePacket) =>{
    const payload = getGamePacketType(gamePacket, gamePackTypeSelect.leaveRoomRequest);

if (!payload) return;

const req = payload.leaveRoomRequest;

// const roomId = await prisma.user.findUnique({
//     where: {
//         id: {
//             userId: socket.userId,
//             roomId: req.roomId
//         }
//     },
// });
if (!socket.userId || !socket.roomId) return;


const roomUser = getUserFromRoom(socket.roomId, socket.userId);
roomUser.


}


export default  leaveRoomRequestHandler;
