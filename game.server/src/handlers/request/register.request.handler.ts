import { Socket } from "net";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from "../../utils/type.converter.js";
import { GamePacketType, gamePackType } from "../../enums/gamePacketType.js";
import registerResponseHandler from "../response/register.response.handler.js";
import { prisma } from "../../utils/db.js";
import { GlobalFailCode } from "../../generated/common/enums.js";
import { validateInput } from "../../utils/validation.js";
import * as bcrypt from "bcrypt";


const registerRequestHandler = async (
  socket: Socket,
  gamePacket: GamePacket
) => {

  const payload = getGamePacketType(gamePacket, gamePackType.registerRequest);
  if (!payload) return; // payload 없으면 종료

  const req = payload.registerRequest;

  // 초기 검증
  if (!req.email || !req.nickname || !req.password) {
    return registerResponseHandler(
      socket,
      setRegisterResponse(
        false,
        "모든 필드가 입력되지 않았습니다.",
        GlobalFailCode.REGISTER_FAILED
      )
    );
  }

  if (!validateInput.email(req.email)) {
    return registerResponseHandler(
      socket,
      setRegisterResponse(
        false,
        "올바른 이메일 형식이 아닙니다",
        GlobalFailCode.REGISTER_FAILED
      )
    );
  }

  if (!validateInput.nickName(req.nickname)) {
    return registerResponseHandler(
      socket,
      setRegisterResponse(
        false,
        "4-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.",
        GlobalFailCode.REGISTER_FAILED
      )
    );
  }

  if (!validateInput.password(req.password)) {
    return registerResponseHandler(
      socket,
      setRegisterResponse(
        false,
        "비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.",
        GlobalFailCode.REGISTER_FAILED
      )
    );
  }

  // 이미 가입된 이메일/닉네임 확인
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: req.email }, { nickname: req.nickname }],
    },
  });

  if (existingUser) {
    return registerResponseHandler(
      socket,
      setRegisterResponse(
        false,
        "이미 가입된 이메일 또는 닉네임입니다.",
        GlobalFailCode.REGISTER_FAILED
      )
    );
  }

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash(req.password, 12);


  // DB에 유저 생성
  await prisma.user.create({
    data: {
      email: req.email,
      nickname: req.nickname,
      password: hashedPassword,
    },
  });

  // 성공 응답
  registerResponseHandler(
    socket,
    setRegisterResponse(true, "회원가입 성공", GlobalFailCode.NONE_FAILCODE)
  );
};


export default registerRequestHandler;


const setRegisterResponse = (
  success: boolean,
  message: string,
  failCode: GlobalFailCode
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
