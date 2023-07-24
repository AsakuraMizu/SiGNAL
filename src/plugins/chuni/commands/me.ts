import { Context } from 'koishi';

export const name = 'chuni.me';

export function apply(ctx: Context) {
  ctx
    .command('chuni.me 我的信息')
    .option('server', '-s <server:string> 指定服务器 默认为samnya', { fallback: 'samnya' })
    .userFields(['aimeUserIdList'])
    .action(async ({ session, options }) => {
      const server = options!.server ?? 'samnya';
      const aimeUserId = session?.user?.aimeUserIdList[server];
      if (!aimeUserId) {
        return '未绑定帐号';
      }
      const { userData } = await ctx.aqua.chuniUserData(server, aimeUserId);

      return (
        `你的信息:\n` +
        `服务器: ${server}\n` +
        `用户名: ${userData.userName}\n` +
        `等级: ${userData.level}\n` +
        `Rating: ${parseFloat(userData.playerRating) / 100}\n` +
        `最高Rating: ${parseFloat(userData.highestRating) / 100}\n` +
        `总计最高分: ${userData.totalHiScore}\n` +
        `Expert总计最高分: ${userData.totalExpertHighScore}\n` +
        `Master总计最高分: ${userData.totalMasterHighScore}\n` +
        `Ultima总计最高分: ${userData.totalUltimaHighScore}\n` +
        `游戏局数: ${userData.playCount}\n`
      );
    });
}
