import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket.js';
import { getGamePacketType } from '../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType.js';
import { sendData } from '../utils/send.data.js';

const cardSelectHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
    const payload = getGamePacketType(gamePacket, gamePackTypeSelect.cardSelectRequest);

    if (!payload || !socket.userId || !socket.roomId) {
        console.log('소켓과 패킷이 전달되지 않았습니다.');
        return;
    }

    const req = payload.cardSelectRequest;

};

export default cardSelectHandler;