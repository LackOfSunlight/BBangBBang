import { C2SRegisterRequest } from '@core/generated/packet/auth';
import { prisma } from '@common/utils/db';
import * as bcrypt from 'bcrypt';

const setUserDbService = async (req: C2SRegisterRequest) => {
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
};

export default setUserDbService;
