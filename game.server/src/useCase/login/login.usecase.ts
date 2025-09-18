import { C2SLoginRequest } from '../../generated/packet/auth';
import { getUserByEmail, setTokenService } from '../../services/prisma.service';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { UserData } from '../../generated/common/types';
import { GamePacketType } from '../../enums/gamePacketType';
import checkUserPassword from '../../services/login/check.user.password';
import { GameSocket } from '../../type/game.socket';
import { addSocket } from '../../managers/socket.manger';

const loginUseCase = async (socket: GameSocket, req: C2SLoginRequest): Promise<GamePacket> => {
	const userInfo = await getUserByEmail(req.email);

	if (!userInfo) {
		return setLoginResponse(
			false,
			'해당 유저는 존재하지 않습니다.',
			'',
			GlobalFailCode.INVALID_REQUEST,
		);
	}

	if (userInfo?.token) {
		return setLoginResponse(false, '로그인 상태 입니다.', '', GlobalFailCode.INVALID_REQUEST);
	}

	if (!(await checkUserPassword(req, userInfo.password))) {
		return setLoginResponse(
			false,
			'비밀번호가 일치하지 않습니다.',
			'',
			GlobalFailCode.INVALID_REQUEST,
		);
	}

	const token = await setTokenService(userInfo.id, userInfo.email);

	socket.userId = userInfo.id.toString();
	addSocket(socket);

	const user: UserData = {
		id: userInfo.id.toString(),
		nickname: userInfo.nickname,
	};

	return setLoginResponse(true, '로그인 성공', token, GlobalFailCode.NONE_FAILCODE, user);
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

export default loginUseCase;
