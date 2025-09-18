import { C2SRegisterRequest } from '../../generated/packet/auth';
import { prisma } from '../../utils/db';

const checkUserDbService = async (req: C2SRegisterRequest): Promise<Boolean> => {
	const isUser = await prisma.user.findFirst({
		where: {
			OR: [{ email: req.email }, { nickname: req.nickname }],
		},
	});

	if (isUser) return false;
	else return true;
};

export default checkUserDbService;
