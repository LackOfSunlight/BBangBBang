import * as bcrypt from 'bcrypt';
import { prisma } from '@common/utils/db';

const setTokenService = async (userId: number, userEmail: string): Promise<string> => {
	const token = await bcrypt.hash(userEmail, 4);

	await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			token: token,
		},
	});

	return token;
};

export default setTokenService;
