import { Context, h } from 'koishi';
import got from 'got';
import { draw } from './draw';
import { cmusic } from '../data';
import { calculateRating } from '../utils';

export const name = 'aqua.crating';

export function apply(ctx: Context) {
  ctx
    .command('aqua.crating 查询rating构成')
    .alias('c30')
    .alias('b30c')
    .action(async ({ session }) => {
      const result = await got
        .post('https://www.diving-fish.com/api/chunithmprober/query/player', {
          json: { qq: session.userId },
        })
        .json<DFishAPIResult>();

      if ('message' in result) {
        if (result.message === 'user not exists')
          return h(
            'message',
            h.quote(session.messageId),
            '请在水鱼查分器 https://www.diving-fish.com/maimaidx/prober/ 上绑定当前QQ号捏'
          );
        else return h('message', h.quote(session.messageId), `发生了错误：${result.message}`);
      }

      return h.image(
        await draw(
          cmusic,
          {
            userName: half2full(result.nickname),
            level: '0',
            playerRating: (result.rating * 100).toString(),
            highestRating: '0',
          },
          result.records.b30.map((e) => ({
            musicId: e.mid.toString(),
            level: e.level_index.toString(),
            scoreMax: e.score.toString(),
            isFullCombo: e.fc === 'fullcombo' ? 'true' : 'false',
            isAllJustice: e.fc === 'alljustice' ? 'true' : 'false',
            rating: calculateRating(cmusic[e.mid]?.levels[e.level_index] ?? 0, e.score),
          })),
          result.records.r10.map((e) => ({
            musicId: e.mid.toString(),
            difficultId: e.level_index.toString(),
            score: e.score.toString(),
            rating: calculateRating(cmusic[e.mid]?.levels[e.level_index] ?? 0, e.score),
          }))
        )
      );
    });
}

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

interface DFishAPIResultEntry {
  cid: number;
  ds: number;
  fc: string;
  level: string;
  level_index: number;
  level_label: string;
  mid: number;
  ra: number;
  score: number;
  title: string;
}

interface DFishAPIResultOK {
  nickname: string;
  rating: number;
  records: {
    b30: DFishAPIResultEntry[];
    r10: DFishAPIResultEntry[];
  };
  username: string;
}

interface DFishAPIResultError {
  message: string;
}

type DFishAPIResult = DFishAPIResultOK | DFishAPIResultError;
