import { Socket } from 'net';
import CustomError from '../error/custom.error.js';
declare const onError: (socket: Socket) => (err: CustomError) => Promise<void>;
export default onError;
//# sourceMappingURL=on.error.d.ts.map