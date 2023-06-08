import { Context } from 'koishi';

export const name = 'aqua.rank';

interface RankEntry {
  name: string;
  pid: string;
  rating: number;
  ratingMax: number;
}

export function apply(ctx: Context) {
  ctx
    .command('aqua.rank [page:integer]')
    .alias('排行')
    .action(async ({ session }, page = 1) => {
      const users = await session.bot.getGuildMemberMap(session.guildId);
      const result: RankEntry[] = [];
      for (let pid in users) {
        const u = await ctx.database.getUser(session.platform, pid);
        if (!u) continue;
        const userId = u.userId;
        if (!userId) continue;
        const { userData } = await ctx.aqua.userData(userId);
        result.push({
          name: users[pid],
          pid: pid,
          rating: parseFloat(userData.playerRating) / 100,
          ratingMax: parseFloat(userData.highestRating) / 100,
        });
      }
      return (
        `群排行榜 (第${page}页):\n` +
        result
          .sort((a, b) => b.rating - a.rating)
          .slice(10 * (page - 1), 10 * page)
          .map((e, i) => `#${10 * (page - 1) + i + 1}: ${e.name}(${e.pid}) ${e.rating.toFixed(2)}(Max ${e.ratingMax.toFixed(2)})`)
          .join('\n')
      );
    });
}
