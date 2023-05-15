import { type Socket, createConnection } from 'node:net';
import { decrypt, encrypt } from './enc';

function getBuffer(length: number, type: number): Buffer {
  const buffer = Buffer.alloc(length);
  buffer.writeUInt32BE(0x3ea18730, 0x00);
  buffer.writeUInt16LE(type, 0x04);
  buffer.writeUInt16LE(length, 0x06);
  return buffer;
}

function Lookup2(socket: Socket, accessCode: string): Promise<number> {
  return new Promise((resolve) => {
    const buffer = getBuffer(0x30, 0x0f);
    buffer.write(accessCode, 0x20, 0x0a, 'hex');
    socket.write(encrypt(buffer));
    socket.once('data', (data) => {
      const buffer = decrypt(data);
      const id = buffer.readInt32LE(0x20);
      socket.end();
      resolve(id);
    });
  });
}

export function getAimeUserId(host: string, accessCode: string): Promise<number> {
  const socket = createConnection(22345, host);
  return Lookup2(socket, accessCode);
}
