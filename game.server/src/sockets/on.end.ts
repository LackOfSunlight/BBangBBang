import { Socket } from 'net';
import { handleError } from '../handlers/handleError.js';
import { removeSocket } from '../managers/socket.manger.js';

const onEnd = (socket:Socket) => async () => {
  try {
    console.log('클라이언트 연결이 종료되었습니다.');
    removeSocket(socket);
  } catch (error) {
    handleError(socket, error);
  }
};

export default onEnd;
