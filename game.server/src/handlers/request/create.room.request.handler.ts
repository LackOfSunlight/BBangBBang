import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from "../../utils/type.converter.js";
import {
  GamePacketType,
  gamePackTypeSelect,
} from "../../enums/gamePacketType.js";
import { RoomData } from "../../generated/common/types.js";
import {
  GlobalFailCode,
  RoomStateType as StateType,
} from "../../generated/common/enums.js";
import { GameSocket } from "../../type/game.socket.js";
import createRoomResponseHandler from "../response/create.room.response.handler.js";
import { Room } from "../../models/room.model.js";
import { prisma } from "../../utils/db.js";
import { RoomStateType } from "../../generated/prisma/index.js";
import { User } from "../../models/user.model.js";

const createRoomRequestHandler = async (
  socket: GameSocket,
  gamePacket: GamePacket
) => {
  const payload = getGamePacketType(
    gamePacket,
    gamePackTypeSelect.createRoomRequest
  );
  if (!payload || !socket.userId)
    return createRoomResponseHandler(
      socket,
      setCreateResponse(false, GlobalFailCode.CREATE_ROOM_FAILED)
    );

  const req = payload.createRoomRequest;

  if (!req.name) {
    return createRoomResponseHandler(
      socket,
      setCreateResponse(false, GlobalFailCode.CREATE_ROOM_FAILED)
    );
  }

  const roomDB = await prisma.room.create({
    data: {
      ownerId: Number(socket.userId),
      name: req.name,
      maxUserNum: req.maxUserNum,
      state: RoomStateType.WAIT,
    },
  });

  const userInfo = await prisma.user.findUnique({
    where: { id: Number(socket.userId) },
  });

  if (!userInfo)
    return createRoomResponseHandler(
      socket,
      setCreateResponse(false, GlobalFailCode.CREATE_ROOM_FAILED)
    );

  const user: User = new User(userInfo.id.toString(), userInfo.nickname);

  const room: Room = new Room(
    roomDB.id,
    socket.userId,
    req.name,
    req.maxUserNum,
    StateType.WAIT,
    [user]
  );

  createRoomResponseHandler(
    socket,
    setCreateResponse(true, GlobalFailCode.NONE_FAILCODE, room)
  );
};

const setCreateResponse = (
  success: boolean,
  failCode: GlobalFailCode,
  room?: RoomData
): GamePacket => {
  const newGamePacket: GamePacket = {
    payload: {
      oneofKind: GamePacketType.createRoomResponse,
      createRoomResponse: {
        success,
        room,
        failCode,
      },
    },
  };

  return newGamePacket;
};

export default createRoomRequestHandler;
