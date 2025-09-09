import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { GlobalFailCode, PhaseType, RoomStateType } from '../../generated/common/enums.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import gameStartResponseHandler from '../response/game.start.response.handler.js';
import gameStartNotificationHandler, { setGameStartNotification } from '../notification/game.start.notification.handler.js';
import characterSpawnPosition from '../../data/character.spawn.position.json'
import { getRoom, saveRoom } from '../../utils/redis.util.js';
import { Room } from '../../models/room.model.js';
import { CharacterPositionData, GameStateData } from '../../generated/common/types.js';
import { User } from '../../models/user.model.js';

const gameStartRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {

    const payload = getGamePacketType(gamePacket, gamePackTypeSelect.gameStartRequest);

    if(!payload || !socket.roomId) {
        return gameStartResponseHandler(socket, setGameStartResponse(false, GlobalFailCode.UNKNOWN_ERROR));
    }

    // 저장된 스폰위치 정보 로드
    const spawnPositions = characterSpawnPosition as CharacterPositionData[];

    const room: Room | null = await getRoom(socket.roomId);

    if(!room){
        return gameStartResponseHandler(socket, setGameStartResponse(false, GlobalFailCode.ROOM_NOT_FOUND));
    }

    const users:User[] = room.users;

    // 위치 셔플, 이걸 response로 전달
    const characterPositionsData = shuffle(spawnPositions);

    // 다음 스테이지 시간 설정
    const now = Date.now();
    const duration = (3 * 60 + 30) * 1000; // 3분 30초 -> 210000ms
    const nextPhaseAt = now + duration;
    const gameState:GameStateData = {
         phaseType: PhaseType.DAY,
         nextPhaseAt: `${nextPhaseAt}`
    }

    room.state = RoomStateType.INGAME;
    await saveRoom(room);

    gameStartResponseHandler(socket, setGameStartResponse(true, GlobalFailCode.NONE_FAILCODE));
    gameStartNotificationHandler(socket, setGameStartNotification(gameState, users, characterPositionsData));
};

const setGameStartResponse = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.gameStartResponse,
			gameStartResponse: {
				success,
				failCode,
			},
		},
	};

	return newGamePacket;
};

const shuffle = <T>(array:T[]): T[] => {
    const result = [...array];

    for(let i = result.length - 1; i>0; i--){
        const j = Math.floor(Math.random() * (i+1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

export default gameStartRequestHandler;
