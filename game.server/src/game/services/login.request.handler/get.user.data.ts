import { C2SLoginRequest } from '@core/generated/packet/auth';
import { prisma } from '@common/utils/db';

const getUserData = async (req: C2SLoginRequest) => {
	const userData = await prisma.user.findUnique({
		where: { email: req.email },
	});

	return userData;
};

export default getUserData;
