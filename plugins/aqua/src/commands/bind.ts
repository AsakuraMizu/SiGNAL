import { Context, h } from 'koishi';

export const name = 'aqua.bind';

export function apply(ctx: Context) {
  ctx
    .command('aqua.bind <accessCode:string> 绑定帐号', { checkArgCount: true })
    .alias('绑卡')
    .usage('目前仅支持水服')
    .userFields(['userId'])
    .action(async ({ session }, accessCode) => {
      if (accessCode.includes('原神')) {
        session.send(
          h.image(
            'https://gchat.qpic.cn/gchatpic_new/2677294549/1091793202-2509998594-0578310DAC7408467F5E797BCBC35915/0'
          )
        );
      }
      if (accessCode.length !== 20 || Number.isNaN(Number(accessCode))) {
        return h('message', h.at(session.userId), '卡号是20位数字，你输的是牛魔酬宾');
      }
      const userId = await ctx.aqua.getAimeUserId(accessCode);
      if (userId !== -1) {
        session.user.userId = userId;
        const { userData } = await ctx.aqua.userData(userId);
        return h(
          'message',
          h.at(session.userId),
          '绑定成功！\n' +
            `用户名: ${userData.userName}\n` +
            `等级: ${userData.level}\n` +
            `Rating: ${parseFloat(userData.playerRating) / 100}\n` +
            `最高Rating: ${parseFloat(userData.highestRating) / 100}\n` +
            `游戏局数: ${userData.playCount}\n` +
            '记得撤回卡号捏！'
        );
      } else {
        return h('message', h.at(session.userId), '绑定失败了qwq');
      }
    });
}
