// import { GameSocket } from '../../type/game.socket.js';
// import { GamePacket } from '../../generated/gamePacket.js';
// import { sendData } from '../../utils/send.data.js';
// import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
// import { GlobalFailCode } from '../../generated/common/enums.js';
// import { getGamePacketType } from '../../utils/type.converter.js';

// const loginResponseHandler = (socket: GameSocket, gamePacket: GamePacket) => {
// 	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.loginResponse);
// 	if (!payload) return;
// 	const res = payload.loginResponse;

// 	if (res.success) console.log('로그인에 성공하였습니다.');
// 	else console.log(res.message);
// 	sendData(socket, gamePacket, GamePacketType.loginResponse);
// };

// export default loginResponseHandler;
