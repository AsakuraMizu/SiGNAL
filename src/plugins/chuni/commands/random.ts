import { Context, h } from 'koishi';
import { pathToFileURL } from 'node:url';
import { levelNames } from '../utils';

export const name = 'aqua.random';

const levels = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '7+',
  '8',
  '8+',
  '9',
  '9+',
  '10',
  '10+',
  '11',
  '11+',
  '12',
  '12+',
  '13',
  '13+',
  '14',
  '14+',
  '15',
  '15+',
];

export function apply(ctx: Context) {
  ctx
    .command('aqua.random <target:text>')
    .shortcut('随', { prefix: true, fuzzy: true })
    .action(async ({ session }, target) => {
      target = target.toLowerCase();
      if (target.includes('we')) {
        const resp = await ctx.chuniData.from('chart').select().eq('diff', 5);
        if (resp.error) throw new Error(JSON.stringify(resp.error))
      }
      const level = levels.find((level) => target.includes(level));
      if (level) {

      }
      // if (levelIdx !== -1) {
      //   // random level
      //   const idx = target.indexOf(levels[levelIdx]);
      //   target = target.slice(0, idx);
      //   let diff = -1; // default all diff
      //   if (target.includes('ult') || target.includes('黑')) diff = 4;
      //   else if (target.includes('mas') || target.includes('紫')) diff = 3;
      //   else if (target.includes('exp') || target.includes('红')) diff = 2;
      //   else if (target.includes('adv') || target.includes('黄')) diff = 1;
      //   else if (target.includes('bas') || target.includes('绿')) diff = 0;
      //   if (levelIdx == 0) {
      //     return h('message', h.quote(session.messageId), '玩音击玩的');
      //   }
      //   const res = randSong(levelIdx, diff);
      //   const id = res.id;
      //   diff = res.diff;
      //   const data = music[id];
      //   return h(
      //     'message',
      //     h.quote(session.messageId),
      //     `[${id}] ${data.name} ${levelNames[diff]}${(data.levels[diff] / 100).toFixed(1)}`,
      //     h.image(pathToFileURL(getJaket(id)).href)
      //   );
      // } else if (
      //   target.includes('we') ||
      //   target.includes("world's end") ||
      //   target.includes('worlds end') ||
      //   target.includes('worldsend')
      // ) {
      //   const filteredMusic = Object.entries(music).filter(([id, entry]) => entry.levels.length === 0);
      //   const t = Math.floor((filteredMusic.length + 1) * Math.random());
      //   const id = filteredMusic[t][0],
      //     data = filteredMusic[t][1];
      //   return h(
      //     'message',
      //     h.quote(session.messageId),
      //     `[${id}] ${data.name}`,
      //     h.image(pathToFileURL(getJaket(id)).href)
      //   );
      // } else if (target.includes('段')) {
      //   let res: SortedMusicEntry[], req: string;
      //   if (target.includes('一段') || target.includes('1段')) {
      //     res = [randSong(levels.indexOf('10')), randSong(levels.indexOf('10+')), randSong(levels.indexOf('11'))];
      //     req = 'MISS 50 回復+10';
      //   } else if (target.includes('二段') || target.includes('2段')) {
      //     res = [randSong(levels.indexOf('11+')), randSong(levels.indexOf('12')), randSong(levels.indexOf('12+'))];
      //     req = 'MISS 50';
      //   } else if (target.includes('三段') || target.includes('3段')) {
      //     res = [randSong(levels.indexOf('12+')), randSong(levels.indexOf('13')), randSong(levels.indexOf('13+'))];
      //     req = 'MISS 30';
      //   } else if (target.includes('四段') || target.includes('4段')) {
      //     res = [randSong(levels.indexOf('13+')), randSong(levels.indexOf('14')), randSong(levels.indexOf('14+'))];
      //     req = 'J以下 500';
      //   } else if (target.includes('五段') || target.includes('5段')) {
      //     res = [randSong(levels.indexOf('14')), randSong(levels.indexOf('14+')), randSong(levels.indexOf('14+'))];
      //     req = 'J以下 300';
      //   } else if (target.includes('无限段')) {
      //     res = [randSong(levels.indexOf('14')), randSong(levels.indexOf('14+')), randSong(levels.indexOf('15'))];
      //     req = 'J以下 150';
      //   }
      //   if (res && req) {
      //     return h(
      //       'message',
      //       h.quote(session.messageId),
      //       res
      //         .map((e) => {
      //           const { id, diff } = e;
      //           const data = music[id];
      //           return `[${id}] ${data.name} ${levelNames[diff]}${(data.levels[diff] / 100).toFixed(1)}`;
      //         })
      //         .join('\n'),
      //       `\n要求: ${req}`
      //     );
      //   } else {
      //     return h('message', h.quote(session.messageId), '哪来的这玩意');
      //   }
      // }
    });
}
