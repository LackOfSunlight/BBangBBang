// import { GameSocket } from '../../type/game.socket.js';
// import { S2CRegisterResponse } from '../../generated/packet/auth.js';
// import { GamePacket } from '../../generated/gamePacket.js';
// import { getGamePacketType } from '../../utils/type.converter.js';
// import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
// import { GlobalFailCode } from '../../generated/common/enums.js';
// import { sendData } from '../../utils/send.data.js';

// const registerResponseHandler = (socket: GameSocket, gamePacket: GamePacket) => {
// 	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.registerResponse);

// 	if (payload) {
// 		if (payload.registerResponse.failCode === GlobalFailCode.NONE_FAILCODE) {
// 			payload.registerResponse.message = '회원가입을 완료하였습니다.';
// 		}
// 	}

// 	sendData(socket, gamePacket, GamePacketType.registerResponse);
// };

// export default registerResponseHandler;
