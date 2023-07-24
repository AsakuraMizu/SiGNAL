import { Buffer } from 'node:buffer';
import { createCipheriv, createDecipheriv } from 'node:crypto';
import { type Socket, createConnection } from 'node:net';
import { Context, Service } from 'koishi';
import { ofetch } from 'ofetch';

namespace AimeDB {
  function encrypt(key: Buffer, buf: Buffer): Buffer {
    const cipher = createCipheriv('aes-128-ecb', key, null);
    cipher.setAutoPadding(false);
    const result = cipher.update(buf);
    return Buffer.concat([result, cipher.final()]);
  }

  function decrypt(key: Buffer, buf: Buffer): Buffer {
    const decipher = createDecipheriv('aes-128-ecb', key, null);
    decipher.setAutoPadding(false);
    const result = decipher.update(buf);
    return Buffer.concat([result, decipher.final()]);
  }

  function getBuffer(length: number, type: number): Buffer {
    const buffer = Buffer.alloc(length);
    buffer.writeUInt32BE(0x3ea18730, 0x00);
    buffer.writeUInt16LE(type, 0x04);
    buffer.writeUInt16LE(length, 0x06);
    return buffer;
  }

  function Lookup2(key: Buffer, socket: Socket, accessCode: string): Promise<number> {
    return new Promise((resolve) => {
      const buffer = getBuffer(0x30, 0x0f);
      buffer.write(accessCode, 0x20, 0x0a, 'hex');
      socket.write(encrypt(key, buffer));
      socket.once('data', (data) => {
        const buffer = decrypt(key, data);
        const id = buffer.readInt32LE(0x20);
        socket.end();
        resolve(id);
      });
    });
  }

  export function getAimeUserId(key: Buffer, host: string, accessCode: string): Promise<number> {
    const socket = createConnection(22345, host);
    return Lookup2(key, socket, accessCode);
  }
}

declare module 'koishi' {
  interface Context {
    aqua: AquaAPI;
  }
}

class AquaAPI extends Service {
  private servers: Record<string, AquaAPI.ServerConfig>;
  private key: Buffer;

  constructor(ctx: Context, config: AquaAPI.Config) {
    super(ctx, 'aqua', true);
    this.servers = config.servers;
    this.key = Buffer.from(config.key);
  }

  get serverNames() {
    return Object.keys(this.servers);
  }

  async getAimeUserId(server: string, accessCode: string) {
    return await AimeDB.getAimeUserId(this.key, this.servers[server].aimedb, accessCode);
  }

  async chuniUserData(server: string, aimeUserId: number) {
    return await ofetch<{
      userId: string;
      userData: AquaAPI.ChuniUserData;
    }>(`http://${this.servers[server].aqua}/ChuniServlet/2.10/A0/ChuniServlet/GetUserDataApi/`, {
      method: 'POST',
      body: { userId: aimeUserId.toString() },
      retry: 3,
    });
  }

  async chuniUserRecent(server: string, aimeUserId: number) {
    return (
      await ofetch<{
        userId: string;
        length: string;
        userRecentRatingList: AquaAPI.ChuniUserRecentRating[];
      }>(`http://${this.servers[server].aqua}/ChuniServlet/2.10/A0/ChuniServlet/GetUserRecentRatingApi/`, {
        method: 'POST',
        body: { userId: aimeUserId.toString() },
        retry: 3,
      })
    ).userRecentRatingList;
  }

  async chuniUserMusic(server: string, aimeUserId: number, nextIndex: number, maxCount: number) {
    return await ofetch<{
      userId: string;
      length: string;
      nextIndex: string;
      userMusicList: {
        length: string;
        userMusicDetailList: AquaAPI.ChuniUserMusicDetail[];
      }[];
    }>(`http://${this.servers[server].aqua}/ChuniServlet/2.10/A0/ChuniServlet/GetUserMusicApi/`, {
      method: 'POST',
      body: {
        userId: aimeUserId.toString(),
        nextIndex: nextIndex.toString(),
        maxCount: maxCount.toString(),
      },
      retry: 3,
    });
  }

  async chuniUserMusicAll(server: string, aimeUserId: number) {
    let nextIndex = 0;
    let userMusicDetailList: AquaAPI.ChuniUserMusicDetail[] = [];
    while (nextIndex !== -1) {
      const result = await this.chuniUserMusic(server, aimeUserId, nextIndex, 200);
      userMusicDetailList = userMusicDetailList.concat(result.userMusicList.map((l) => l.userMusicDetailList).flat());
      nextIndex = parseInt(result.nextIndex);
    }
    return userMusicDetailList;
  }
}

namespace AquaAPI {
  export interface ServerConfig {
    aimedb: string;
    aqua: string;
  }

  export interface Config {
    servers: Record<string, ServerConfig>;
    key: string;
  }

  export interface ChuniUserData {
    accessCode: string;
    userName: string;
    level: string;
    exp: string;
    totelPoint: string;
    playCount: string;
    playerRating: string;
    highestRating: string;
    nameplateId: string;
    frameId: string;
    characterId: string;
    trophyId: string;
    totalMapNum: string;
    totalBasicHighScore: string;
    totalAdvancedHighScore: string;
    totalExpertHighScore: string;
    totalMasterHighScore: string;
    totalUltimaHighScore: string;
    totalHiScore: string;
    friendCount: string;
    lastGameId: string;
    lastRomVersion: string;
    lastDataVersion: string;
    lastPlayDate: string;
    overPowerPoint: string;
  }

  export interface ChuniUserRecentRating {
    musicId: string;
    difficultId: string;
    romVersionCode: string;
    score: string;
  }

  export interface ChuniUserMusicDetail {
    musicId: string;
    level: string;
    playCount: string;
    scoreMax: string;
    resRequestCount: string;
    resAcceptCount: string;
    resSuccessCount: string;
    missCount: string;
    maxComboCount: string;
    isFullCombo: string;
    isAllJustice: string;
    isSuccess: string;
    fullChain: string;
    maxChain: string;
    scoreRank: string;
    isLock: string;
    theoryCount: string;
  }
}

export default AquaAPI;
