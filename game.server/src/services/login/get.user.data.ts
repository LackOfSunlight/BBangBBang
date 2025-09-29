import { C2SLoginRequest } from '../../Generated/packet/auth';
import { prisma } from '../../Utils/db';

const getUserData = async (req: C2SLoginRequest) => {
	const userData = await prisma.user.findUnique({
		where: { email: req.email },
	});

	return userData;
};

export default getUserData;
