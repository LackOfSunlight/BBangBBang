import { Socket } from "net";
import { handleError } from "../handlers/handleError.js";
import { handleGamePacket } from "../handlers/gamePacketHandler.js"
import { GamePacket } from "../generated/gamePacket.js";

interface Packet {
  payloadType: number;
  version: string;
  sequence: number;
  payload: Buffer;
}

export const onData = (socket:Socket, chunk: Buffer) => {
  try {
    let buffer = Buffer.alloc(0);

    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 11) {
      // 최소 헤더 크기: type(2) + verLen(1) + seq(4) + payloadLen(4)
      const payloadType = buffer.readUint16BE(0);
      const versionLength = buffer.readUint8(2);
      const headerLen = 2 + 1 + versionLength + 4 + 4;

      if (buffer.length < headerLen) return;

      const version = buffer.toString("utf8", 3, 3 + versionLength);
      const sequence = buffer.readUint32BE(3 + versionLength);
      const payloadLength = buffer.readUint32BE(3 + versionLength + 4);

      if (buffer.length < headerLen + payloadLength) return;

      const payloadStart = headerLen;
      const payloadEnd = headerLen + payloadLength;
      const payloadBuf = buffer.subarray(payloadStart, payloadEnd);

      const packet: Packet = {
        payloadType: payloadType,
        version: version,
        sequence: sequence,
        payload: payloadBuf,
      };

      console.log(
        `패킷 수신: type=${packet.payloadType}, seq=${packet.sequence}`
      );

      const gamePacket = GamePacket.fromBinary(payloadBuf);
      handleGamePacket(socket, gamePacket);

      buffer = buffer.subarray(payloadEnd);
    }
  } catch (error) {

    handleError(socket, error);
  }
};
