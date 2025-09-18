import * as bcrypt from 'bcrypt';
import checkUserPassword from '../check.user.password';
import { C2SLoginRequest } from '../../../generated/packet/auth';

jest.mock('bcrypt', () => ({
	compare: jest.fn(),
}));

describe('checkUserPassword', () => {
	const mockReq: C2SLoginRequest = {
		email: 'test@naver.com',
		password: 'qwer1234!!',
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('비밀번호 일치하면 true', async () => {
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);

		const result = await checkUserPassword(mockReq, 'hashedPassword123');

		expect(bcrypt.compare).toHaveBeenCalledWith(mockReq.password, 'hashedPassword123');

		expect(result).toBe(true);
	});

	it('비밀번호가 일치하지 않으면 false', async () => {
		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		const result = await checkUserPassword(mockReq, 'wrongHashedPassword');

		expect(bcrypt.compare).toHaveBeenCalledWith(mockReq.password, 'wrongHashedPassword');

		expect(result).toBe(false);
	});
});
