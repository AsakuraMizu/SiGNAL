import { Context, Service } from 'koishi';
import got from 'got';
import { getAimeUserId } from './aimedb';
import { calculateRating } from './utils';
import { music } from './data';

declare module 'koishi' {
  interface Context {
    aqua: API;
  }
}

namespace API {
  export interface Config {
    aimedb: string;
    aqua: string;
  }

  export interface UserData {
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
    totalHiScore: string;
    friendCount: string;
    lastGameId: string;
    lastRomVersion: string;
    lastDataVersion: string;
    lastPlayDate: string;
  }

  export interface UserRecentRating {
    musicId: string;
    difficultId: string;
    romVersionCode: string;
    score: string;
  }

  export interface UserMusicDetail {
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

  export interface UserMusic {
    length: string;
    userMusicDetailList: UserMusicDetail[];
  }

  export interface R10Item extends UserRecentRating {
    rating: number;
  }

  export interface B30Item extends UserMusicDetail {
    rating: number;
  }
}

class API extends Service {
  private aimedb: string;
  private aqua: string;

  constructor(ctx: Context, config: API.Config) {
    super(ctx, 'aqua', true);
    this.aimedb = config.aimedb;
    this.aqua = config.aqua;
  }

  getAimeUserId(accessCode: string) {
    return getAimeUserId(this.aimedb, accessCode);
  }

  async userData(userId: number) {
    return await got
      .post(`https://${this.aqua}/ChuniServlet/2.10/A0/ChuniServlet/GetUserDataApi/`, {
        json: { userId: userId.toString() },
      })
      .json<{
        userId: string;
        userData: API.UserData;
      }>();
  }

  async recent(userId: number) {
    return await got
      .post(`https://${this.aqua}/ChuniServlet/2.10/A0/ChuniServlet/GetUserRecentRatingApi/`, {
        json: { userId: userId.toString() },
      })
      .json<{
        userId: string;
        length: string;
        userRecentRatingList: API.UserRecentRating[];
      }>();
  }

  async r10(userId: number) {
    const { userRecentRatingList } = await this.recent(userId);
    return userRecentRatingList
      .map(
        (entry): API.R10Item => ({
          ...entry,
          rating: calculateRating(music[entry.musicId]?.levels[entry.difficultId] ?? 0, parseInt(entry.score)),
        })
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }

  async music(userId: number, nextIndex: number, maxCount: number) {
    return await got
      .post(`https://${this.aqua}/ChuniServlet/2.10/A0/ChuniServlet/GetUserMusicApi/`, {
        json: {
          userId: userId.toString(),
          nextIndex: nextIndex.toString(),
          maxCount: maxCount.toString(),
        },
      })
      .json<{
        userId: string;
        length: string;
        nextIndex: string;
        userMusicList: API.UserMusic[];
      }>();
  }

  async musicAll(userId: number) {
    let nextIndex = 0;
    let userMusicList: API.UserMusic[] = [];
    while (nextIndex !== -1) {
      const result = await this.music(userId, nextIndex, 200);
      userMusicList = userMusicList.concat(result.userMusicList);
      nextIndex = parseInt(result.nextIndex);
    }
    return userMusicList;
  }

  async b30(userId: number) {
    const userMusicList = await this.musicAll(userId);
    return userMusicList
      .flatMap(({ userMusicDetailList }) =>
        userMusicDetailList.map((entry): API.B30Item => {
          return {
            ...entry,
            rating: calculateRating(music[entry.musicId]?.levels[entry.level] ?? 0, parseInt(entry.scoreMax)),
          };
        })
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 30);
  }
}

export default API;
