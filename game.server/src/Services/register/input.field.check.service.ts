import { C2SRegisterRequest } from '../../Generated/packet/auth';

const inputFieldCheckService = (req: C2SRegisterRequest): boolean => {
	if (!req.email || !req.nickname || !req.password) {
		return false;
	}

	return true;
};

export default inputFieldCheckService;
