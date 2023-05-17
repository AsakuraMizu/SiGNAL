import { Context, h } from 'koishi';
import { draw } from './draw';
import { music } from '../data';

export const name = 'aqua.rating';

export function apply(ctx: Context) {
  ctx
    .command('aqua.rating 查询rating构成')
    .alias('b30')
    .userFields(['userId'])
    .action(async ({ session }) => {
      const userId = session.user.userId;
      if (!userId) return h.quote(session.messageId) + '还妹有绑定帐号！使用 sb 绑卡 <accessCode> 绑定帐号捏';
      const { userData } = await ctx.aqua.userData(userId);
      const b30 = await ctx.aqua.b30(userId);
      const r10 = await ctx.aqua.r10(userId);

      return h.image(await draw(music, userData, b30, r10));
    });
}
