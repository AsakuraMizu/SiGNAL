import { Context, h } from 'koishi';
import { OtogameAPIClient } from '../apis/otogame';

export const name = 'chuni.bind';

export function apply(ctx: Context) {
  ctx
    .command('chuni.bind <id:string> 绑定帐号')
    .alias('绑卡')
    .option('server', '-s <server:string> 指定服务器 默认为samnya', { fallback: 'samnya' })
    .example('chuni.bind -s samnya 原神真好玩 绑定samnya服帐号')
    .example('绑卡 原神不好玩 绑定samnya服帐号')
    .example('绑卡 -s oto ??? 绑定大饼帐号')
    .example('绑大饼 ??? 绑定大饼帐号')
    .shortcut(/^绑大饼(.*)$/, { fuzzy: true, options: { server: 'oto' } })
    .userFields(['aimeUserIdList', 'otogameTokens'])
    .action(async ({ session, options }, id) => {
      if (options?.server === 'oto') {
        if (!id) return '大饼帐号绑定教程: https://blog.stellopath.net/posts/sibot-chuni-otogame-help';

        const otogame = new OtogameAPIClient({ refreshToken: id.trim(), accessToken: '', idToken: '' });
        const profile = await otogame.chunithmProfile();
        session!.user!.otogameTokens = otogame.tokens;

        return h(
          'message',
          h.at(session?.userId),
          '绑定成功！\n' +
            `服务器: otogame\n` +
            `用户名: ${profile.user_name}\n` +
            `等级: ${profile.level}\n` +
            `Rating: ${(profile.player_rating / 100).toFixed(2)}\n` +
            `最高Rating: ${(profile.highest_rating / 100).toFixed(2)}\n` +
            `游戏局数: ${profile.play_count}\n` +
            '记得撤回token捏！'
        );
      } else if (options?.server === 'samnya') {
        if (!id) return await session?.execute('chuni.bind -h');
        const { server } = options;
        if (id.includes('原神')) {
          session?.send(
            h.image(
              'https://gchat.qpic.cn/gchatpic_new/2677294549/1091793202-2509998594-0578310DAC7408467F5E797BCBC35915/0'
            )
          );
        }
        if (id.length !== 20 || Number.isNaN(Number(id))) {
          return h('message', h.at(session?.userId), '卡号是20位数字，你输的是牛魔酬宾');
        }
        const aimeUserId = await ctx.aqua.getAimeUserId(server, id);
        if (aimeUserId !== -1) {
          session!.user!.aimeUserIdList[server] = aimeUserId;
          const { userData } = await ctx.aqua.chuniUserData(server, aimeUserId);
          return h(
            'message',
            h.at(session?.userId),
            '绑定成功！\n' +
              `服务器: ${server}\n` +
              `用户名: ${userData.userName}\n` +
              `等级: ${userData.level}\n` +
              `Rating: ${parseFloat(userData.playerRating) / 100}\n` +
              `最高Rating: ${parseFloat(userData.highestRating) / 100}\n` +
              `游戏局数: ${userData.playCount}\n` +
              '记得撤回卡号捏！'
          );
        } else {
          return h('message', h.at(session?.userId), '绑定失败了qwq');
        }
      } else {
        return '未知服务器';
      }
    });
}
