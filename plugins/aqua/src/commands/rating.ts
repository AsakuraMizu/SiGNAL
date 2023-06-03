import { Context, h } from 'koishi';
import { draw } from './draw';
import { music, music_sp } from '../data';

export const name = 'aqua.rating';

export function apply(ctx: Context) {
  ctx
    .command('aqua.rating [user:user] 查询rating构成')
    .alias('b30')
    .option('sunplus', '-p')
    .userFields(['userId'])
    .action(async ({ session, options }, user) => {
      let userId: number;
      if (user) {
        const [ platform, pid ] = user.split(':');;
        userId = (await ctx.database.getUser(platform, pid)).userId;
      } else {
        userId = session.user.userId;
      }
      if (!userId) return h.quote(session.messageId) + '还妹有绑定帐号！使用 sb 绑卡 <accessCode> 绑定帐号捏';
      const { userData } = await ctx.aqua.userData(userId);
      const b30 = await ctx.aqua.b30(userId, options.sunplus);
      const r10 = await ctx.aqua.r10(userId, options.sunplus);

      return h.image(await draw(options.sunplus ? music_sp : music, userData, b30, r10, options.sunplus));
    });
}
