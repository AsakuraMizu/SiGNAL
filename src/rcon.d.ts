declare module 'modern-rcon' {
  export class RconError extends Error {
    constructor(message: string);
  }

  export default class Rcon {
    constructor(host: string, port: number, password: string, timeout?: number);
    constructor(host: string, password: string, timeout?: number);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(data: string, cmd?: number): Promise<string>;
  }
}
