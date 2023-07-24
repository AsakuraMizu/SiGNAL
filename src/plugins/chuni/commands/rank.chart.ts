import { Context, h } from 'koishi';
import { levelNames } from '../utils';

export const name = 'chuni.rank.chart';

interface RankEntry {
  name: string;
  pid: string;
  score: number;
  playCount: number;
}

export function apply(ctx: Context) {
  ctx
    .command('chuni.rank.chart <id:integer> <diff:integer>')
    .alias('单曲排行')
    .option('server', '-s <server:string> 指定服务器 默认为samnya', { fallback: 'samnya' })
    .shortcut('柚子排行', { args: ['2245', '3'] })
    .action(async ({ session, options }, id, diff) => {
      if (!id || !diff) return await session?.execute('chuni.rank.chart -h');
      const server = options!.server ?? 'samnya';

      const resp1 = await ctx.chuniData.from('music').select().eq('id', id);
      if (resp1.error) throw new Error(JSON.stringify(resp1.error));
      if (resp1.data.length === 0) return '无效id';
      const m = resp1.data[0];

      const resp2 = await ctx.chuniData.from('chart').select().eq('music_id', id).eq('diff', diff);
      if (resp2.error) throw new Error(JSON.stringify(resp2.error));
      if (resp2.data.length === 0) return '无效难度';

      const users = await session!.bot.getGuildMemberMap(session!.guildId!);
      const result: RankEntry[] = [];
      for (let pid in users) {
        const u = await ctx.database.getUser(session!.platform!, pid);
        if (!u) continue;
        const aimeUserId = u.aimeUserIdList[server];
        if (!aimeUserId) continue;
        const userMusicDetailList = await ctx.aqua.chuniUserMusicAll(server, aimeUserId);
        if (!userMusicDetailList) {
          console.log(aimeUserId);
          continue;
        }
        const e = userMusicDetailList.find((d) => Number(d.musicId) === id && Number(d.level) == diff);
        if (e)
          result.push({
            name: users[pid],
            pid: pid,
            score: Number(e.scoreMax),
            playCount: Number(e.playCount),
          });
      }
      return h(
        'message',
        `[${id}] ${m.title} ${levelNames[diff]} 分数排行\n` +
          result
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((e, i) => `#${i + 1}: ${e.name} ${e.score}`)
            .join('\n') +
          '\npc数排行\n' +
          result
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, 5)
            .map((e, i) => `#${i + 1}: ${e.name} ${e.playCount}pc`)
            .join('\n')
      );
    });
}
