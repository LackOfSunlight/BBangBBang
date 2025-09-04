import { Socket } from 'net';
import { handleError } from '../handlers/handleError.js';

const onEnd = (socket:Socket) => async () => {
  try {
    console.log('클라이언트 연결이 종료되었습니다.');
  } catch (error) {
    handleError(socket, error);
  }
};

export default onEnd;
