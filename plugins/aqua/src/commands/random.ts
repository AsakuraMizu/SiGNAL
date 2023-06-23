import { Context, h } from 'koishi';
import { getJaket, music, sortedMusic } from '../data';
import { pathToFileURL } from 'node:url';
import { levelNames } from '../utils';

export const name = 'aqua.random';

// prettier-ignore
const levels = ['1', '2', '3', '4', '5', '6', '7', '7+', '8', '8+', '9', '9+', '10', '10+', '11', '11+', '12', '12+', '13', '13+', '14', '14+', '15', '15+'].reverse();
// prettier-ignore
const ranges = [100, 200, 300, 400, 500, 600, 700,  750, 800,  850, 900, 950,  1000, 1050,  1100, 1150,  1200, 1250,  1300, 1350,  1400, 1450,  1500, 1550].reverse();

export function apply(ctx: Context) {
  ctx
    .command('aqua.random [target:string]')
    .shortcut('随', { prefix: true, fuzzy: true })
    .action(async ({ session }, target) => {
      target = target.toLowerCase();
      const levelIdx = levels.findIndex((level) => target.includes(level));
      if (levelIdx !== -1) {
        // random level
        const idx = target.indexOf(levels[levelIdx]);
        target = target.slice(0, idx);
        let diff = -1; // default all diff
        if (target.includes('ult') || target.includes('黒')) diff = 4;
        else if (target.includes('mas') || target.includes('紫')) diff = 3;
        else if (target.includes('exp') || target.includes('红')) diff = 2;
        else if (target.includes('adv') || target.includes('黄')) diff = 1;
        else if (target.includes('bas') || target.includes('绿')) diff = 0;
        if (levelIdx == 0) {
          return h('message', h.quote(session.messageId), '玩音击玩的');
        }
        const filteredMusic = diff === -1 ? sortedMusic : sortedMusic.filter((e) => e.diff == diff);
        const l = filteredMusic.findIndex((e) => e.level >= ranges[levelIdx]); // must not be -1
        const r = filteredMusic.findIndex((e) => e.level >= ranges[levelIdx - 1]); // may be -1
        const t = l + Math.floor(((r == -1 ? filteredMusic.length : r) - l) * Math.random());
        const id = filteredMusic[t].id;
        diff = filteredMusic[t].diff;
        const data = music[id];
        return h(
          'message',
          h.quote(session.messageId),
          `[${id}] ${data.name} ${levelNames[diff]}${(data.levels[diff] / 100).toFixed(1)}`,
          h.image(pathToFileURL(getJaket(id)).href)
        );
      }
    });
}
