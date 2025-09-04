// server.ts
import { createServer } from "net";
import { handleData } from "./handlers/packetHandler.js";
import  onConnection  from "./sockets/on.connection.js";

const PORT = 3000;

const server = createServer(onConnection);

// 서버 실행
server.listen(PORT, () => {
  console.log(`:로켓: TCP 서버 실행 중 : 포트 ${PORT}`);
});
