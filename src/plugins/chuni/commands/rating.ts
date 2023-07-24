import { Context, h } from 'koishi';
import { PromisePool } from '@supercharge/promise-pool';
import { draw, type RequiredUserData } from '../draw';
import {
  calcRatingList,
  type RatingItem,
  type GameVer,
  preparePlaylogList,
  findMusicId,
  type PlaylogItem,
} from '../utils';
import * as dfish from '../apis/dfish';
import { OtogameAPIClient } from '../apis/otogame';

export const name = 'chuni.rating';

function half2full(src: string) {
  let result = '';
  for (let i = 0; i < src.length; i++) {
    const code = src.charCodeAt(i);
    if (code === 32) result += String.fromCharCode(12288);
    else if (code < 127) result += String.fromCharCode(code + 65248);
    else result = src[i];
  }
  return result;
}

export function apply(ctx: Context) {
  ctx
    .command('chuni.rating [user:user] 查询rating构成')
    .alias('b30')
    .option('mode', '-m <mode:string> 查询模式 默认为hdd', { fallback: 'hdd' })
    .option('server', '-s <server:string> hdd模式下指定服务器 默认为samnya', { fallback: 'samnya' })
    .example('b30 查询samnya服b30')
    .example('b30 -m hdd -s samnya 查询samnya服b30')
    .example('b30 -m hddjp 查询samnya服b30，使用日服定数')
    .example('b30p 查询samnya服b30，使用日服定数')
    .shortcut('b30p', { options: { mode: 'hddjp' } })
    .example('b30 -m cn 查询国服b30')
    .example('b30c 查询国服b30')
    .shortcut('b30c', { options: { mode: 'cn' } })
    .example('b30 -m oto 查询大饼b30')
    .example('b30o 查询大饼b30')
    .shortcut('b30o', { options: { mode: 'oto' } })
    .userFields(['aimeUserIdList', 'otogameTokens'])
    .action(async ({ session, options }, user) => {
      let userData: RequiredUserData;
      let b30: RatingItem[];
      let r10: RatingItem[];
      let gamever: GameVer = 'hdd';

      if (options?.mode === 'cn') {
        const result = await dfish.chunithmQueryPlayer({ qq: session!.userId! });

        if ('message' in result) {
          if (result.message === 'user not exists')
            return h(
              'message',
              h.quote(session?.messageId),
              '用户不存在捏！',
              user ? '请在水鱼查分器 https://www.diving-fish.com/maimaidx/prober/ 上绑定捏' : '请检查输入捏'
            );
          else return h('message', h.quote(session?.messageId), `发生了错误：${result.message}`);
        }

        gamever = 'cn';
        userData = {
          userName: half2full(result.nickname),
          level: 0,
          rating: result.rating,
        };
        b30 = result.records.b30.map((e) => ({
          musicId: e.mid,
          diff: e.level_index,
          score: e.score,
          fc: e.fc === 'fullcombo',
          aj: e.fc === 'alljustice',
          rating: e.ra,
          levelBase: e.ds,
        }));
        r10 = result.records.r10.map((e) => ({
          musicId: e.mid,
          diff: e.level_index,
          score: e.score,
          rating: e.ra,
          levelBase: e.ds,
        }));
      } else if (options?.mode === 'oto') {
        if (!session?.user?.otogameTokens.refreshToken)
          return '大饼帐号绑定教程: https://blog.stellopath.net/posts/sibot-chuni-otogame-help';
        const otogame = new OtogameAPIClient(session!.user!.otogameTokens);

        try {
          const profile = await otogame.chunithmProfile();
          userData = {
            userName: profile.user_name,
            level: profile.level,
            rating: profile.player_rating / 100,
            ratingMax: profile.highest_rating / 100,
          };

          const playlog = await otogame.chunithmPlaylogAll();
          const { best, recent } = await preparePlaylogList(
            (
              await PromisePool.for(playlog).process(async (e) => ({
                playDate: e.play_date,
                musicId: await findMusicId(ctx.chuniData, e.music.name, e.music.artist),
                diff: e.difficulty,
                score: e.score,
                fc: e.is_full_combo,
                aj: e.is_all_justice,
              }))
            ).results.filter((e) => !!e.musicId) as PlaylogItem[]
          );
          b30 = await calcRatingList(ctx.chuniData, best, 30, 'jp');
          r10 = await calcRatingList(ctx.chuniData, recent, 10, 'jp');

          session!.user!.otogameTokens = otogame.tokens;
        } catch (e) {
          console.error(e);
          return h('message', h.quote(session.messageId), '查询失败, 请重试或尝试重新绑定');
        }
      } else if (options?.mode?.startsWith('hdd')) {
        const server = options?.server ?? 'samnya';
        if (!ctx.aqua.serverNames.includes(server)) return '未知服务器';
        gamever = options.mode.endsWith('jp') ? 'jp' : 'hdd';

        let userId: number | undefined;
        if (user) {
          const [platform, pid] = user.split(':');
          const u = await ctx.database.getUser(platform, pid);
          if (u) userId = u.aimeUserIdList[server];
        } else {
          userId = session?.user?.aimeUserIdList[server];
        }
        if (!userId) return h.quote(session?.messageId) + '还妹有绑定帐号！使用 sb 绑卡 绑定帐号捏';

        const {
          userData: { userName, level, playerRating, highestRating },
        } = await ctx.aqua.chuniUserData(server, userId);
        userData = {
          userName,
          level: Number(level),
          rating: gamever === 'jp' ? undefined : Number(playerRating) / 100,
          ratingMax: gamever === 'jp' ? undefined : Number(highestRating) / 100,
        };
        b30 = await calcRatingList(
          ctx.chuniData,
          (
            await ctx.aqua.chuniUserMusicAll(server, userId)
          ).map((e) => ({
            musicId: Number(e.musicId),
            diff: Number(e.level),
            score: Number(e.scoreMax),
            fc: e.isFullCombo === 'true',
            aj: e.isAllJustice === 'true',
          })),
          30,
          gamever
        );
        r10 = await calcRatingList(
          ctx.chuniData,
          (
            await ctx.aqua.chuniUserRecent(server, userId)
          ).map((e) => ({
            musicId: Number(e.musicId),
            diff: Number(e.difficultId),
            score: Number(e.score),
          })),
          10,
          gamever
        );
      } else {
        return '未知模式';
      }

      return h.image(await draw(ctx.chuniData, userData, b30, r10));
    });
}
