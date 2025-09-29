import { GlobalFailCode } from '../../Generated/common/enums';
import { GamePacket } from '../../Generated/gamePacket';
import inputFieldCheckService from '../../Services/register/input.field.check.service';
import { validateInput } from '../../Utils/validation';
import checkUserDbService from '../../Services/register/check.user.db.service';
import { C2SRegisterRequest } from '../../Generated/packet/auth';
import { createUserDB } from '../../Services/prisma.service';
import { GameSocket } from '../../Type/game.socket';
import { registerResponseForm } from '../../Converter/packet.form';

export const registerUseCase = async (
	socket: GameSocket,
	req: C2SRegisterRequest,
): Promise<GamePacket> => {
	try {
		// 초기 검증
		if (!inputFieldCheckService(req)) {
			return registerResponseForm(
				false,
				'모든 필드가 입력되지 않았습니다.',
				GlobalFailCode.REGISTER_FAILED,
			);
		}

		if (!validateInput.email(req.email)) {
			return registerResponseForm(
				false,
				'올바른 이메일 형식이 아닙니다',
				GlobalFailCode.REGISTER_FAILED,
			);
		}

		if (!validateInput.nickName(req.nickname)) {
			return registerResponseForm(
				false,
				'4-20자의 한글, 영문, 숫자, 언더스코어만 사용 가능합니다.',
				GlobalFailCode.REGISTER_FAILED,
			);
		}

		if (!validateInput.password(req.password)) {
			return registerResponseForm(
				false,
				'비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.',
				GlobalFailCode.REGISTER_FAILED,
			);
		}

		// 이미 가입된 이메일/닉네임 확인
		if (!(await checkUserDbService(req))) {
			return registerResponseForm(
				false,
				'이미 가입된 이메일 또는 닉네임입니다.',
				GlobalFailCode.REGISTER_FAILED,
			);
		}

		// DB에 회원가입 저장
		await createUserDB(req);

		// 성공 응답
		return registerResponseForm(true, '회원가입 성공', GlobalFailCode.NONE_FAILCODE);
	} catch (error) {
		return registerResponseForm(false, '서버 에러', GlobalFailCode.UNKNOWN_ERROR);
	}
};
