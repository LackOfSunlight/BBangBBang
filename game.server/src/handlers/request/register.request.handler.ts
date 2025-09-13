import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import registerResponseHandler from '../response/register.response.handler.js';
import { prisma } from '../../utils/db.js';
import { GlobalFailCode } from '../../generated/common/enums.js';
import { validateInput } from '../../utils/validation.js';
import * as bcrypt from 'bcrypt';
import { handleError } from '../handleError.js';
import inputFieldCheckService from '../../services/register.request.handler/input.field.check.service.js';
import checkUserDbService from '../../services/register.request.handler/check.user.db.service.js';
import setUserDbService from '../../services/register.request.handler/set.user.db.service.js';

const registerRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.registerRequest);
	if (!payload) return; // payload 없으면 종료

	const req = payload.registerRequest;

	// 초기 검증
	if (!inputFieldCheckService(req)) {
		return registerResponseHandler(
			socket,
			setRegisterResponse(
				false,
				'모든 필드가 입력되지 않았습니다.',
				GlobalFailCode.REGISTER_FAILED,
			),
		);
	}

	if (!validateInput.email(req.email)) {
		return registerResponseHandler(
			socket,
			setRegisterResponse(false, '올바른 이메일 형식이 아닙니다', GlobalFailCode.REGISTER_FAILED),
		);
	}

	if (!validateInput.nickName(req.nickname)) {
		return registerResponseHandler(
			socket,
			setRegisterResponse(
				false,
				'4-20자의 한글, 영문, 숫자, 언더스코어만 사용 가능합니다.',
				GlobalFailCode.REGISTER_FAILED,
			),
		);
	}

	if (!validateInput.password(req.password)) {
		return registerResponseHandler(
			socket,
			setRegisterResponse(
				false,
				'비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.',
				GlobalFailCode.REGISTER_FAILED,
			),
		);
	}

	try {
		// 이미 가입된 이메일/닉네임 확인
		if (!(await checkUserDbService(req))) {
			return registerResponseHandler(
				socket,
				setRegisterResponse(
					false,
					'이미 가입된 이메일 또는 닉네임입니다.',
					GlobalFailCode.REGISTER_FAILED,
				),
			);
		}

		// DB에 회원가입 저장
		await setUserDbService(req);

		// 성공 응답
		registerResponseHandler(
			socket,
			setRegisterResponse(true, '회원가입 성공', GlobalFailCode.NONE_FAILCODE),
		);
	} catch (err) {
		handleError(socket, err);
	}
};

export default registerRequestHandler;

const setRegisterResponse = (
	success: boolean,
	message: string,
	failCode: GlobalFailCode,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.registerResponse,
			registerResponse: {
				success,
				message,
				failCode,
			},
		},
	};

	return newGamePacket;
};
