import { apply as KoishiPluginStatus } from 'koishi-plugin-status';
import SiGNAL from '../main';
import PluginBase from './base';

interface CommonOptions {

}

export default class Common extends PluginBase<CommonOptions> {
  apply(app: SiGNAL) {
    app.koishi.plugin(KoishiPluginStatus);
    app.koishi.command('status.info', { description: '应用信息' })
      .action(async ({ session }) => {
        const { nickname, userId } = await session.$bot.getLoginInfo();
        const versionInfo = await session.$bot.getVersionInfo();
        const {
          coolqEdition,
          pluginVersion,
          pluginBuildNumber,
          pluginBuildConfiguration,
          goCqhttp,
          runtimeVersion,
          runtimeOs,
        } = versionInfo;
        return [
          '[SiGNAL] 应用信息',
          `登录账号：${nickname}(${userId})`,
          `酷Q版本：${goCqhttp ? `go-cqhttp-${runtimeOs}-${runtimeVersion}` : coolqEdition}`,
          `HTTP API：${pluginVersion}-${pluginBuildNumber}-${pluginBuildConfiguration}`,
        ].join('\n');
      });
  }
}
