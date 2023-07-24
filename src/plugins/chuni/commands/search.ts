import { Context } from 'koishi';

export const name = 'chuni.search';

export function apply(ctx: Context) {
  ctx.command('chuni.search <keyword:text> 按标题搜索歌曲').action(async ({}, keyword) => {
    const resp = await ctx.chuniData.from('music').select().ilike('title', `%${keyword}%`);
    if (resp.error) throw new Error(JSON.stringify(resp.error));
    return resp.data.map(({ id, title, artist }) => `[${id}] ${title} - ${artist}`).join('\n');
  });
}
