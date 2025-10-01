import { C2SLoginRequest } from '../../generated/packet/auth';
import { getUserByEmail, setTokenService } from '../../services/prisma.service';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { UserData } from '../../generated/common/types';
import { GameSocket } from '../../type/game.socket';
import socketManger from '../../managers/socket.manger';
import { loginResponseForm } from '../../converter/packet.form';
import checkUserPassword from '../../services/login.request.handler/check.user.password';

const loginUseCase = async (socket: GameSocket, req: C2SLoginRequest): Promise<GamePacket> => {
	try {
		const userInfo = await getUserByEmail(req.email);

		if (!userInfo) {
			return loginResponseForm(
				false,
				'해당 유저는 존재하지 않습니다.',
				'',
				GlobalFailCode.INVALID_REQUEST,
			);
		}

		if (userInfo?.token) {
			return loginResponseForm(false, '로그인 상태 입니다.', '', GlobalFailCode.INVALID_REQUEST);
		}

		if (!(await checkUserPassword(req, userInfo.password))) {
			return loginResponseForm(
				false,
				'비밀번호가 일치하지 않습니다.',
				'',
				GlobalFailCode.INVALID_REQUEST,
			);
		}

		const token = await setTokenService(userInfo.id, userInfo.email);

		socket.userId = userInfo.id.toString();
		socketManger.addSocket(socket);

		const user: UserData = {
			id: userInfo.id.toString(),
			nickname: userInfo.nickname,
		};

		return loginResponseForm(true, '로그인 성공', token, GlobalFailCode.NONE_FAILCODE, user);
	} catch (error) {
		return loginResponseForm(false, '서버 에러', ' ', GlobalFailCode.UNKNOWN_ERROR);
	}
};

export default loginUseCase;
