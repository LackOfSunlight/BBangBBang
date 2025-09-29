import checkUserDbService from '../check.user.db.service';
import { prisma } from '../../../Utils/db';
import { C2SRegisterRequest } from '../../../Generated/packet/auth';

jest.mock('../../../utils/db', () => ({
	prisma: {
		user: {
			findFirst: jest.fn(),
		},
	},
}));

describe('checkUserDbService', () => {
	const mockReq: C2SRegisterRequest = {
		email: 'test@naver.com',
		nickname: '가나다라',
		password: 'qwer1234',
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('DB에 사용자가 존재하면 false 반환', async () => {
		(prisma.user.findFirst as jest.Mock).mockResolvedValue({
			id: 1,
			email: mockReq.email,
			nickname: mockReq.nickname,
		});

		const result = await checkUserDbService(mockReq);
		expect(result).toBe(false);
		expect(prisma.user.findFirst).toHaveBeenCalledWith({
			where: { OR: [{ email: mockReq.email }, { nickname: mockReq.nickname }] },
		});
	});

	it('DB에 사용자 없으면 true 반환', async () => {
		(prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

		const result = await checkUserDbService(mockReq);
		expect(result).toBe(true);
		expect(prisma.user.findFirst).toHaveBeenCalledWith({
			where: { OR: [{ email: mockReq.email }, { nickname: mockReq.nickname }] },
		});
	});
});
