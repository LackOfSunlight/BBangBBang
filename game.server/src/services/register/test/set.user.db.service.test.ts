import setUserDbService from '../set.user.db.service';
import { prisma } from '../../../utils/db';
import * as bcrypt from 'bcrypt';
import { C2SRegisterRequest } from '../../../generated/packet/auth';

jest.mock('../../../utils/db', () => ({
	prisma: {
		user: {
			create: jest.fn(),
		},
	},
}));

jest.mock('bcrypt', () => ({
	hash: jest.fn(),
}));

describe('setUserDbService', () => {
	const mockReq = {
		email: 'test@naver.com',
		nickname: 'qwer',
		password: 'Password123!',
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('비밀번호를 해시하고 DB에 유저 생성', async () => {
		(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

		await setUserDbService(mockReq);

		expect(bcrypt.hash).toHaveBeenCalledWith(mockReq.password, 12);

		expect(prisma.user.create).toHaveBeenCalledWith({
			data: {
				email: mockReq.email,
				nickname: mockReq.nickname,
				password: 'hashedPassword',
			},
		});
	});
});
