import { GlobalFailCode } from "../../generated/common/enums";
import { GamePacket } from "../../generated/gamePacket";
import { GamePacketType } from "../../enums/gamePacketType";
import inputFieldCheckService from "../../services/register/input.field.check.service";
import { validateInput } from "../../utils/validation";
import checkUserDbService from "../../services/register/check.user.db.service";
import { C2SRegisterRequest } from "../../generated/packet/auth";
import { createUserDB } from "../../services/prisma.service";


export const registerUseCase = async (req: C2SRegisterRequest) : Promise<GamePacket> => {
    	// 초기 검증s
	if (!inputFieldCheckService(req)) {
		return setRegisterResponse(	false, '모든 필드가 입력되지 않았습니다.',GlobalFailCode.REGISTER_FAILED,);		
	}

	if (!validateInput.email(req.email)) {
		return setRegisterResponse(false, '올바른 이메일 형식이 아닙니다', GlobalFailCode.REGISTER_FAILED);
	
	}

	if (!validateInput.nickName(req.nickname)) {
		return setRegisterResponse(false, '4-20자의 한글, 영문, 숫자, 언더스코어만 사용 가능합니다.', GlobalFailCode.REGISTER_FAILED);
	
	}

	if (!validateInput.password(req.password)) {
		return setRegisterResponse( false, '비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.', GlobalFailCode.REGISTER_FAILED);
	}

		// 이미 가입된 이메일/닉네임 확인
	if (!(await checkUserDbService(req))) {
			return  setRegisterResponse( false, '이미 가입된 이메일 또는 닉네임입니다.', GlobalFailCode.REGISTER_FAILED,);
    }

	// DB에 회원가입 저장
	await createUserDB(req);

		// 성공 응답
	return setRegisterResponse(true, '회원가입 성공', GlobalFailCode.NONE_FAILCODE);
		
}


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