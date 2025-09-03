// server.ts
import { createServer } from "net";
import { handleData } from "./handlers/packetHandler.js";

const PORT = 3000;

const server = createServer((socket) => {
  console.log("클라이언트 접속:", socket.remoteAddress, socket.remotePort);

  socket.on("data", (chunk: Buffer) => {
    handleData(socket, chunk);
  });

  socket.on("end", () => {
    console.log("클라이언트 종료");
  });

  socket.on("error", (err) => {
    console.error("소켓 에러:", err);
  });
});

// 서버 실행
server.listen(PORT, () => {
  console.log(`:로켓: TCP 서버 실행 중 : 포트 ${PORT}`);
});
