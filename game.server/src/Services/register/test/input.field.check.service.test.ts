import { C2SRegisterRequest } from '../../../generated/packet/auth';
import inputFieldCheckService from '../input.field.check.service';

describe('inputFieldCheckService', () => {
	it('모든 필드가 존재하면 true 반환', () => {
		const req: C2SRegisterRequest = {
			email: 'test@example.com',
			nickname: '홍길동',
			password: 'password123',
		};
		const result = inputFieldCheckService(req);
	});

	it('email이 없으면 false 반환', () => {
		const req: C2SRegisterRequest = {
			email: '',
			nickname: '홍길동',
			password: 'password123',
		};
		const result = inputFieldCheckService(req);
		expect(result).toBe(false);
	});

	it('nickName이 없으면 false 반환', () => {
		const req: C2SRegisterRequest = {
			email: 'test@example.com',
			nickname: '',
			password: 'password123',
		};
		const result = inputFieldCheckService(req);
		expect(result).toBe(false);
	});

	it('password가 없으면 false 반환', () => {
		const req: C2SRegisterRequest = {
			email: 'test@example.com',
			nickname: '홍길동',
			password: '',
		};
		const result = inputFieldCheckService(req);
		expect(result).toBe(false);
	});

	it('모든 필드가 없으면 false 반환', () => {
		const req: C2SRegisterRequest = {
			email: '',
			nickname: '',
			password: '',
		};
		const result = inputFieldCheckService(req);
		expect(result).toBe(false);
	});
});
