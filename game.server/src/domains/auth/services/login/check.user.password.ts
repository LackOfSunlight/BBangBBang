import { C2SLoginRequest } from '../../../../generated/packet/auth';
import * as bcrypt from 'bcrypt';

const checkUserPassword = async (req: C2SLoginRequest, password: string): Promise<boolean> => {
	const passwordCheck = await bcrypt.compare(req.password, password);

	return passwordCheck;
};

export default checkUserPassword;
