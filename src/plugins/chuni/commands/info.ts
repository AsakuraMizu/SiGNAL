import { Context, h } from 'koishi';
import { levelNames } from '../utils';

export const name = 'chuni.info';

export function apply(ctx: Context) {
  ctx
    .command('chuni.info <id:integer> 查询歌曲信息')
    .usage('搜索歌曲请使用 chuni.search')
    .action(async ({ session }, id) => {
      if (!id || !Number.isFinite(id)) return await session?.execute('chuni.info -h');
      id = Number(id);

      const resp1 = await ctx.chuniData.from('music').select().eq('id', id);
      if (resp1.error) throw new Error(JSON.stringify(resp1.error));
      if (resp1.data.length === 0) return '没找到捏';
      const m = resp1.data[0];

      const resp2 = await ctx.chuniData.from('chart').select().eq('music_id', id);
      if (resp2.error) throw new Error(JSON.stringify(resp2.error));
      const charts = resp2.data;

      return h(
        'message',
        `[${id}] ${m.title}\n` +
          `${m.artist}\n` +
          charts
            .map(
              (e) =>
                `${levelNames[e.diff]} ${(e.const_cn || 0).toFixed(1)}/${(e.const_hdd || 0).toFixed(1)}/${(
                  e.const_jp || 0
                ).toFixed(1)}`
            )
            .join('\n'),
        h.image(ctx.chuniData.storage.from('jacket').getPublicUrl(`webp/${id}.webp`).data.publicUrl)
      );
    });
}
