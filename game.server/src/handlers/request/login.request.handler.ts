import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import loginResponseHandler from '../response/login.response.handler.js';
import { GlobalFailCode } from '../../generated/common/enums.js';
import { UserData } from '../../generated/common/types.js';
import { prisma } from '../../utils/db.js';
import * as bcrypt from 'bcrypt';
import { addSocket } from '../../sockets/socket.manger.js';

const loginRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.loginRequest);
	if (!payload) return;

	const req = payload.loginRequest;

	const userinfo = await prisma.user.findUnique({
		where: { email: req.email },
	});

	if (!userinfo) {
		return loginResponseHandler(
			socket,
			setLoginResponse(false, '가입되지 않은 회원입니다.', '', GlobalFailCode.REGISTER_FAILED),
		);
	}

	const passwordCheck = await bcrypt.compare(req.password, userinfo.password);

	if (!passwordCheck) {
		return loginResponseHandler(
			socket,
			setLoginResponse(false, '비밀번호가 일치하지 않습니다.', '', GlobalFailCode.UNKNOWN_ERROR),
		);
	}

	socket.userId = userinfo.id.toString();
	addSocket(socket);

	const user: UserData = {
		id: userinfo.id.toString(),
		nickname: userinfo.nickname,
	};

	loginResponseHandler(
		socket,
		setLoginResponse(true, '로그인 성공', userinfo.email, GlobalFailCode.NONE_FAILCODE, user),
	);

}


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
