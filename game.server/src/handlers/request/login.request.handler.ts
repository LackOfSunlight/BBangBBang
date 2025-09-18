import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import loginResponseHandler from '../response/login.response.handler.js';
import { GlobalFailCode } from '../../generated/common/enums.js';
import { UserData } from '../../generated/common/types.js';
import * as bcrypt from 'bcrypt';
import { addSocket } from '../../managers/socket.manger.js';
import getUserData from '../../services/login.request.handler/get.user.data.js';
import checkUserPassword from '../../services/login.request.handler/check.user.password.js';
import setTokenService from '../../services/login.request.handler/set.token.service.js';

const loginRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.loginRequest);
	if (!payload) return;

	const req = payload.loginRequest;

	const userInfo = await getUserData(req);

	if (!userInfo) {
		return loginResponseHandler(
			socket,
			setLoginResponse(false, '해당 유저는 존재하지 않습니다.', '', GlobalFailCode.INVALID_REQUEST),
		);
	}

	if (userInfo?.token) {
		return loginResponseHandler(
			socket,
			setLoginResponse(false, '로그인 상태 입니다.', '', GlobalFailCode.INVALID_REQUEST),
		);
	}

	if (!(await checkUserPassword(req, userInfo.password))) {
		return loginResponseHandler(
			socket,
			setLoginResponse(false, '비밀번호가 일치하지 않습니다.', '', GlobalFailCode.INVALID_REQUEST),
		);
	}

	const token = await setTokenService(userInfo.id, userInfo.email);

	socket.userId = userInfo.id.toString();
	addSocket(socket);

	const user: UserData = {
		id: userInfo.id.toString(),
		nickname: userInfo.nickname,
	};

	loginResponseHandler(
		socket,
		setLoginResponse(true, '로그인 성공', token, GlobalFailCode.NONE_FAILCODE, user),
	);
};

const setLoginResponse = (
	success: boolean,
	message: string,
	token: string,
	failCode: GlobalFailCode,
	myInfo?: UserData,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.loginResponse,
			loginResponse: {
				success: success,
				message: message,
				token: token,
				myInfo: myInfo,
				failCode: failCode,
			},
		},
	};

	return newGamePacket;
};

export default loginRequestHandler;
