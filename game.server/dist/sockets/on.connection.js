import { onData } from "./on.data.js";
import onEnd from "./on.end.js";
import onError from "./on.error.js";
const onConnection = (socket) => {
    socket.on('data', (chunk) => onData(socket, chunk));
    socket.on('end', onEnd(socket));
    socket.on('error', onError(socket));
};
export default onConnection;
